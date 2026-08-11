<?php
declare(strict_types=1);


namespace App\Service;

use App\Entity\Subscription;
use App\Enum\PlanEnum;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\SubscriptionRepository;
use App\Repository\WorkspaceRepository;
use Psr\Log\LoggerInterface;

/**
 * Handles Paddle webhook events.
 *
 * @see https://developer.paddle.com/guides/webhooks
 *
 * Class PaddleWebhookService
 * @package App\Service
 * @author Vandeth Tho <thovandeth@gmail.com>
 */
readonly class PaddleWebhookService
{
    private array $doubleEspressoPriceIds;
    private array $espressoPriceIds;

    public function __construct(
        private SubscriptionRepository $subscriptionRepository,
        private WorkspaceRepository $workspaceRepository,
        private LoggerInterface $logger,
        string $paddlePriceIdEspressoMonthly,
        string $paddlePriceIdEspressoAnnual,
        string $paddlePriceIdDoubleEspressoMonthly,
        string $paddlePriceIdDoubleEspressoAnnual,
    ) {
        $this->doubleEspressoPriceIds = array_filter([$paddlePriceIdDoubleEspressoMonthly, $paddlePriceIdDoubleEspressoAnnual]);
        $this->espressoPriceIds = array_filter([$paddlePriceIdEspressoMonthly, $paddlePriceIdEspressoAnnual]);
    }

    public function handleEvent(array $event): void
    {
        $eventType = $event['event_type'] ?? '';
        $data = $event['data'] ?? [];

        match ($eventType) {
            'subscription.created' => $this->handleSubscriptionCreated($data),
            'subscription.activated' => $this->handleSubscriptionUpdated($data),
            'subscription.trialing' => $this->handleSubscriptionUpdated($data),
            'subscription.updated' => $this->handleSubscriptionUpdated($data),
            'subscription.imported' => $this->handleSubscriptionCreated($data),
            'subscription.canceled' => $this->handleSubscriptionCanceled($data),
            'subscription.paused' => $this->handleSubscriptionPaused($data),
            'subscription.resumed' => $this->handleSubscriptionResumed($data),
            'subscription.past_due' => $this->handleSubscriptionPastDue($data),
            default => $this->logger->info('Unhandled Paddle event: ' . $eventType),
        };
    }

    private function handleSubscriptionCreated(array $data): void
    {
        $paddleSubId = $data['id'] ?? '';
        $customData = $data['custom_data'] ?? [];
        $workspacePublicId = $customData['workspace_public_id'] ?? null;

        if (!$workspacePublicId) {
            $this->logger->warning('Paddle subscription.created missing workspace_public_id');
            return;
        }

        $workspace = $this->workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            $this->logger->warning('Workspace not found: ' . $workspacePublicId);
            return;
        }

        $subscription = $this->subscriptionRepository->findByWorkspace($workspace);
        if ($subscription === null) {
            $subscription = new Subscription();
            $subscription->setWorkspace($workspace);
            $this->subscriptionRepository->persist($subscription);
        }

        $subscription->setPlan($this->resolvePlanFromItems($data['items'] ?? []));
        $subscription->setStatus($this->mapStatus($data['status'] ?? 'active'));
        $subscription->setPaddleSubscriptionId($paddleSubId);
        $subscription->setPaddleCustomerId($data['customer_id'] ?? null);
        // One row per workspace, so a customer who cancelled and came back reuses it. Clearing the
        // cancellation is what makes that row live again — and is why the terminal guard on the
        // other handlers can't strand a genuine re-subscribe.
        $subscription->setCanceledAt(null);

        if (isset($data['current_billing_period']['ends_at'])) {
            $subscription->setCurrentPeriodEnd(DateService::mutableParse($data['current_billing_period']['ends_at']));
        }

        // Paddle trial period
        if (isset($data['scheduled_change']['action']) && $data['scheduled_change']['action'] === 'resume') {
            // Trial with scheduled resume = trial ends at the effective_at date
            if (isset($data['scheduled_change']['effective_at'])) {
                $subscription->setTrialEndsAt(DateService::mutableParse($data['scheduled_change']['effective_at']));
            }
        }

        $this->subscriptionRepository->flush();
    }

    private function handleSubscriptionUpdated(array $data): void
    {
        $subscription = $this->findByPaddleId($data['id'] ?? '');
        if ($subscription === null) return;
        if ($this->isTerminated($subscription, 'subscription.updated')) return;

        $subscription->setStatus($this->mapStatus($data['status'] ?? 'active'));

        // Update plan if items are present (handles upgrades/downgrades)
        if (!empty($data['items'])) {
            $subscription->setPlan($this->resolvePlanFromItems($data['items']));
        }

        if (isset($data['current_billing_period']['ends_at'])) {
            $subscription->setCurrentPeriodEnd(DateService::mutableParse($data['current_billing_period']['ends_at']));
        }

        // Update trial end date if still trialing
        if (($data['status'] ?? '') === 'trialing' && isset($data['next_billed_at'])) {
            $subscription->setTrialEndsAt(DateService::mutableParse($data['next_billed_at']));
        }

        // Clear trial when no longer trialing
        if (($data['status'] ?? '') === 'active') {
            $subscription->setTrialEndsAt(null);
        }

        $this->subscriptionRepository->flush();
    }

    private function handleSubscriptionCanceled(array $data): void
    {
        $subscription = $this->findByPaddleId($data['id'] ?? '');
        if ($subscription === null) return;

        $subscription->setStatus(SubscriptionStatusEnum::Canceled);
        $subscription->setCanceledAt(DateService::mutableNow());
        $this->subscriptionRepository->flush();
    }

    private function handleSubscriptionPaused(array $data): void
    {
        $subscription = $this->findByPaddleId($data['id'] ?? '');
        if ($subscription === null) return;
        if ($this->isTerminated($subscription, 'subscription.paused')) return;

        $subscription->setStatus(SubscriptionStatusEnum::Paused);
        $this->subscriptionRepository->flush();
    }

    private function handleSubscriptionResumed(array $data): void
    {
        $subscription = $this->findByPaddleId($data['id'] ?? '');
        if ($subscription === null) return;
        if ($this->isTerminated($subscription, 'subscription.resumed')) return;

        $subscription->setStatus(SubscriptionStatusEnum::Active);
        $this->subscriptionRepository->flush();
    }

    private function handleSubscriptionPastDue(array $data): void
    {
        $subscription = $this->findByPaddleId($data['id'] ?? '');
        if ($subscription === null) return;
        if ($this->isTerminated($subscription, 'subscription.past_due')) return;

        $subscription->setStatus(SubscriptionStatusEnum::PastDue);
        $this->subscriptionRepository->flush();
    }

    private function findByPaddleId(string $paddleSubId): ?Subscription
    {
        $subscription = $this->subscriptionRepository->findByPaddleSubscriptionId($paddleSubId);
        if ($subscription === null) {
            $this->logger->warning('Paddle subscription not found: ' . $paddleSubId);
        }
        return $subscription;
    }

    /**
     * Cancellation is terminal for a Paddle subscription id — Paddle has no un-cancel, and a
     * resume applies to a paused subscription, never a canceled one. So any status event arriving
     * afterwards is either dunning that was already in flight or a retry, and acting on it would
     * quietly resurrect a subscription the customer (or a workspace deletion) ended.
     *
     * Guarding on canceledAt rather than the status: it's the durable record of "we ended this",
     * and rows that already drifted have it set while their status says otherwise.
     *
     * A genuine re-subscribe is unaffected — Paddle mints a new subscription id, which arrives as
     * subscription.created and takes the row over there.
     */
    private function isTerminated(Subscription $subscription, string $eventType): bool
    {
        if ($subscription->getCanceledAt() === null) {
            return false;
        }

        $this->logger->info('Ignoring {event} for a canceled subscription', [
            'event' => $eventType,
            'paddleSubscriptionId' => $subscription->getPaddleSubscriptionId(),
            'canceledAt' => $subscription->getCanceledAt()->format('c'),
        ]);

        return true;
    }

    /**
     * Resolves the plan from the Paddle webhook items array.
     * Paddle sends items[].price.id — we match against configured price IDs.
     */
    private function resolvePlanFromItems(array $items): PlanEnum
    {
        foreach ($items as $item) {
            $priceId = $item['price']['id'] ?? null;
            if ($priceId === null) {
                continue;
            }

            if (in_array($priceId, $this->doubleEspressoPriceIds, true)) {
                return PlanEnum::DoubleEspresso;
            }

            if (in_array($priceId, $this->espressoPriceIds, true)) {
                return PlanEnum::Espresso;
            }
        }

        // Fallback to Espresso if no price ID matched (backwards compatibility)
        $this->logger->warning('Could not resolve plan from Paddle items, defaulting to Espresso', [
            'items' => $items,
        ]);

        return PlanEnum::Espresso;
    }

    private function mapStatus(string $paddleStatus): SubscriptionStatusEnum
    {
        return match ($paddleStatus) {
            'active' => SubscriptionStatusEnum::Active,
            'past_due' => SubscriptionStatusEnum::PastDue,
            'canceled' => SubscriptionStatusEnum::Canceled,
            'paused' => SubscriptionStatusEnum::Paused,
            'trialing' => SubscriptionStatusEnum::Trialing,
            default => SubscriptionStatusEnum::Active,
        };
    }
}

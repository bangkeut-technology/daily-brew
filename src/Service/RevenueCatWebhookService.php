<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Subscription;
use App\Enum\PlanEnum;
use App\Enum\SubscriptionSourceEnum;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use Psr\Log\LoggerInterface;

/**
 * Handles RevenueCat webhook events for mobile (iOS/Android) subscriptions.
 *
 * RevenueCat sends events when a subscription is created, renewed, canceled, etc.
 * The app_user_id in RevenueCat = User publicId in DailyBrew.
 * We resolve the workspace from the user's currentWorkspace.
 */
class RevenueCatWebhookService
{
    public function __construct(
        private SubscriptionRepository $subscriptionRepository,
        private UserRepository $userRepository,
        private WorkspaceRepository $workspaceRepository,
        private LoggerInterface $logger,
    ) {}

    public function handleEvent(array $event): void
    {
        $eventType = $event['type'] ?? '';
        $eventData = $event['event'] ?? [];

        match ($eventType) {
            'INITIAL_PURCHASE' => $this->handlePurchase($eventData),
            'RENEWAL' => $this->handleRenewal($eventData),
            'CANCELLATION' => $this->handleCancellation($eventData),
            'EXPIRATION' => $this->handleExpiration($eventData),
            'PRODUCT_CHANGE' => $this->handleRenewal($eventData),
            'BILLING_ISSUE' => $this->handleBillingIssue($eventData),
            default => $this->logger->info('Unhandled RevenueCat event: ' . $eventType),
        };
    }

    private function handlePurchase(array $data): void
    {
        $appUserId = $data['app_user_id'] ?? '';
        $workspace = $this->resolveWorkspace($appUserId);
        if ($workspace === null) return;

        $subscription = $this->subscriptionRepository->findByWorkspace($workspace);
        if ($subscription === null) {
            $subscription = new Subscription();
            $subscription->setWorkspace($workspace);
            $this->subscriptionRepository->persist($subscription);
        }

        $subscription->setPlan(PlanEnum::Espresso);
        $subscription->setSource(SubscriptionSourceEnum::RevenueCat);
        $subscription->setRevenuecatSubscriptionId($data['original_transaction_id'] ?? $data['id'] ?? null);

        // Determine status
        if (!empty($data['period_type']) && $data['period_type'] === 'TRIAL') {
            $subscription->setStatus(SubscriptionStatusEnum::Trialing);
            if (!empty($data['expiration_at_ms'])) {
                $subscription->setTrialEndsAt(
                    (new \DateTimeImmutable())->setTimestamp((int) ($data['expiration_at_ms'] / 1000))
                );
            }
        } else {
            $subscription->setStatus(SubscriptionStatusEnum::Active);
            $subscription->setTrialEndsAt(null);
        }

        if (!empty($data['expiration_at_ms'])) {
            $subscription->setCurrentPeriodEnd(
                (new \DateTimeImmutable())->setTimestamp((int) ($data['expiration_at_ms'] / 1000))
            );
        }

        $this->subscriptionRepository->flush();
    }

    private function handleRenewal(array $data): void
    {
        $subscription = $this->findSubscription($data);
        if ($subscription === null) {
            // Fallback: treat as new purchase
            $this->handlePurchase($data);
            return;
        }

        $subscription->setStatus(SubscriptionStatusEnum::Active);
        $subscription->setTrialEndsAt(null);

        if (!empty($data['expiration_at_ms'])) {
            $subscription->setCurrentPeriodEnd(
                (new \DateTimeImmutable())->setTimestamp((int) ($data['expiration_at_ms'] / 1000))
            );
        }

        $this->subscriptionRepository->flush();
    }

    private function handleCancellation(array $data): void
    {
        $subscription = $this->findSubscription($data);
        if ($subscription === null) return;

        $subscription->setStatus(SubscriptionStatusEnum::Canceled);
        $subscription->setCanceledAt(DateService::now());
        $this->subscriptionRepository->flush();
    }

    private function handleExpiration(array $data): void
    {
        $subscription = $this->findSubscription($data);
        if ($subscription === null) return;

        $subscription->setStatus(SubscriptionStatusEnum::Canceled);
        $this->subscriptionRepository->flush();
    }

    private function handleBillingIssue(array $data): void
    {
        $subscription = $this->findSubscription($data);
        if ($subscription === null) return;

        $subscription->setStatus(SubscriptionStatusEnum::PastDue);
        $this->subscriptionRepository->flush();
    }

    private function findSubscription(array $data): ?Subscription
    {
        // Try by RevenueCat transaction ID
        $transactionId = $data['original_transaction_id'] ?? $data['id'] ?? '';
        if ($transactionId) {
            $sub = $this->subscriptionRepository->findByRevenuecatSubscriptionId($transactionId);
            if ($sub !== null) return $sub;
        }

        // Fallback: resolve by app_user_id → user → workspace
        $workspace = $this->resolveWorkspace($data['app_user_id'] ?? '');
        if ($workspace !== null) {
            return $this->subscriptionRepository->findByWorkspace($workspace);
        }

        $this->logger->warning('RevenueCat subscription not found for event', $data);
        return null;
    }

    private function resolveWorkspace(string $appUserId): ?\App\Entity\Workspace
    {
        if (empty($appUserId) || str_starts_with($appUserId, '$RCAnonymousID')) {
            $this->logger->warning('RevenueCat event with anonymous or empty user ID: ' . $appUserId);
            return null;
        }

        $user = $this->userRepository->findByPublicId($appUserId);
        if ($user === null) {
            $this->logger->warning('User not found for RevenueCat app_user_id: ' . $appUserId);
            return null;
        }

        $workspace = $user->getCurrentWorkspace();
        if ($workspace === null) {
            // Try first owned workspace as fallback
            $owned = $this->workspaceRepository->findByOwner($user);
            $workspace = $owned[0] ?? null;
        }

        if ($workspace === null) {
            $this->logger->warning('No workspace found for user: ' . $appUserId);
        }

        return $workspace;
    }
}

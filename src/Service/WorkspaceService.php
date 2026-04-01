<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Subscription;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Enum\SubscriptionSourceEnum;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\SubscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class WorkspaceService
{
    public function __construct(
        private EntityManagerInterface $em,
        private SubscriptionRepository $subscriptionRepository,
        private HttpClientInterface $httpClient,
        private LoggerInterface $logger,
        private string $paddleApiKey,
        private string $paddleEnvironment,
    ) {}

    public function create(User $owner, string $name, ?string $timezone = null): Workspace
    {
        $workspace = new Workspace();
        $workspace->setName($name);
        $workspace->setOwner($owner);

        $setting = new WorkspaceSetting();
        $setting->setWorkspace($workspace);

        if ($timezone !== null && \in_array($timezone, \DateTimeZone::listIdentifiers(), true)) {
            $setting->setTimezone($timezone);
        }

        $workspace->setSetting($setting);

        $subscription = new Subscription();
        $subscription->setWorkspace($workspace);

        // Set as current workspace for the owner
        $owner->setCurrentWorkspace($workspace);

        $this->em->persist($workspace);
        $this->em->persist($setting);
        $this->em->persist($subscription);
        $this->em->flush();

        return $workspace;
    }

    public function update(Workspace $workspace, string $name): Workspace
    {
        $workspace->setName($name);
        $this->em->flush();

        return $workspace;
    }

    public function delete(Workspace $workspace): void
    {
        $now = DateService::now();

        // Cancel active subscription before deleting
        $subscription = $this->subscriptionRepository->findByWorkspace($workspace);
        if ($subscription !== null && $subscription->isActive()) {
            $this->cancelSubscription($subscription);
        }

        // Soft-delete all employees in this workspace
        foreach ($workspace->getEmployees() as $employee) {
            $employee->setDeletedAt($now);
            $employee->setLinkedUser(null);
        }

        $workspace->setDeletedAt($now);
        $this->em->flush();
    }

    private function cancelSubscription(Subscription $subscription): void
    {
        // Cancel via Paddle API if it's a paid Paddle subscription
        if (
            $subscription->getSource() === SubscriptionSourceEnum::Paddle
            && $subscription->getPaddleSubscriptionId() !== null
        ) {
            $this->cancelPaddleSubscription($subscription->getPaddleSubscriptionId());
        }

        // Mark as canceled locally regardless
        $subscription->setStatus(SubscriptionStatusEnum::Canceled);
        $subscription->setCanceledAt(DateService::mutableNow());
    }

    private function cancelPaddleSubscription(string $paddleSubscriptionId): void
    {
        $baseUrl = $this->paddleEnvironment === 'sandbox'
            ? 'https://sandbox-api.paddle.com'
            : 'https://api.paddle.com';

        try {
            $this->httpClient->request('POST', $baseUrl . '/subscriptions/' . $paddleSubscriptionId . '/cancel', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->paddleApiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'effective_from' => 'immediately',
                ],
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to cancel Paddle subscription: ' . $e->getMessage(), [
                'paddleSubscriptionId' => $paddleSubscriptionId,
            ]);
            // Don't block workspace deletion if Paddle API fails
        }
    }
}

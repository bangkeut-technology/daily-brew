<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Subscription;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\SubscriptionRepository;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceSettingRepository;
use App\Service\Image\AvatarImageProcessor;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class WorkspaceService
{
    public function __construct(
        private WorkspaceRepository $workspaceRepository,
        private WorkspaceSettingRepository $workspaceSettingRepository,
        private SubscriptionRepository $subscriptionRepository,
        private AvatarImageProcessor $imageProcessor,
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

        $this->workspaceRepository->persist($workspace);
        $this->workspaceSettingRepository->persist($setting);
        $this->subscriptionRepository->persist($subscription);
        $this->workspaceRepository->flush();

        return $workspace;
    }

    public function update(Workspace $workspace, string $name): Workspace
    {
        $workspace->setName($name);
        $this->workspaceRepository->flush();

        return $workspace;
    }

    /**
     * Rotates the workspace QR token, invalidating all existing QR codes
     * and NFC tags printed/programmed with the old token. The new token
     * is unique (Workspace.qrToken column) — collision risk is negligible
     * with TokenGenerator's 20-char alphabet, but if it ever happened the
     * unique constraint would surface as a DBAL error and the owner could
     * retry. Sub-QR tokens (WorkspaceQrCode) are not touched here.
     */
    public function regenerateQrToken(Workspace $workspace): Workspace
    {
        $workspace->regenerateQrToken();
        $this->workspaceRepository->flush();

        return $workspace;
    }

    /**
     * Stores the workspace logo on disk via Vich's "workspaces" mapping and
     * persists the resulting filename. The processor squares and crops the
     * upload so every logo on the dashboard renders consistently.
     *
     * @throws \InvalidArgumentException when the upload fails validation
     *         (see {@see \App\Service\Image\AvatarImageProcessor}).
     */
    public function uploadLogo(Workspace $workspace, UploadedFile $file): Workspace
    {
        $processed = $this->imageProcessor->process($file);
        $workspace->setImageFile($processed);
        $this->workspaceRepository->flush();

        return $workspace;
    }

    public function removeLogo(Workspace $workspace): void
    {
        if ($workspace->getImageName() === null) {
            return;
        }

        $workspace->setImageFile(null);
        $workspace->setImageName(null);
        $workspace->setFileSize(null);
        $workspace->setOriginalName(null);
        $workspace->setMimeType(null);
        $workspace->setDimensions(null);
        $this->workspaceRepository->flush();
    }

    public function delete(Workspace $workspace): void
    {
        $now = DateService::now();

        // Cancel active subscription before deleting
        $subscription = $this->subscriptionRepository->findByWorkspace($workspace);
        if ($subscription !== null && $subscription->isActive()) {
            $this->cancelSubscription($subscription);
        }

        // Clear currentWorkspace on the owner so they don't land back on the
        // deleted workspace via the stored selector. Frontend localStorage is
        // also cleared by the caller, but the server-side selector is the
        // fallback when the query param is absent.
        $owner = $workspace->getOwner();
        if ($owner !== null && $owner->getCurrentWorkspace()?->getId() === $workspace->getId()) {
            $owner->setCurrentWorkspace(null);
        }

        // Soft-delete all employees in this workspace and clear currentWorkspace
        // on any linked user pointing here, for the same reason.
        foreach ($workspace->getEmployees() as $employee) {
            $employee->setDeletedAt($now);
            $linkedUser = $employee->getLinkedUser();
            if ($linkedUser !== null && $linkedUser->getCurrentWorkspace()?->getId() === $workspace->getId()) {
                $linkedUser->setCurrentWorkspace(null);
            }
            $employee->setLinkedUser(null);
        }

        $workspace->setDeletedAt($now);
        $this->workspaceRepository->flush();
    }

    private function cancelSubscription(Subscription $subscription): void
    {
        // Cancel via Paddle API if it's a paid subscription
        if ($subscription->getPaddleSubscriptionId() !== null) {
            $this->cancelPaddleSubscription($subscription->getPaddleSubscriptionId());
        }

        // Mark as canceled locally regardless
        $subscription->setStatus(SubscriptionStatusEnum::Canceled);
        $subscription->setCanceledAt(DateService::mutableNow());
    }

    /**
     * Force-cancel a subscription from the admin panel. Same Paddle-call-then-local-mark
     * behavior as workspace deletion, but as an explicit operator action that does NOT
     * delete the workspace. Idempotent — calling on an already-canceled subscription is a no-op.
     */
    public function forceCancelSubscription(Subscription $subscription): void
    {
        if ($subscription->getStatus() === SubscriptionStatusEnum::Canceled) {
            return;
        }
        $this->cancelSubscription($subscription);
        $this->subscriptionRepository->flush();
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

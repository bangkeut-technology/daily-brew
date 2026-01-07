<?php
/**
 * This file is part of the DailyBrew project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/17/25 10:09AM
 * @see     https://dailybrew.work
 * Copyright (c) 2025 DailyBrew. All rights reserved.
 */
declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use App\Enum\ApiErrorCodeEnum;
use App\Exception\ApiException;
use App\Repository\WorkspaceUserRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;

/**
 *
 * Class AccountDeletionService
 *
 * @package App\Service
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class AccountDeletionService
{
    public function __construct(
        private EntityManagerInterface  $em,
        private WorkspaceUserRepository $workspaceUserRepository,
    ) {}

    /**
     * @return array{deletedWorkspaces: string[]}
     */
    public function deleteAccount(User $user, ?DateTimeImmutable $now = null): array
    {
        $now ??= new DateTimeImmutable();

        return $this->em->wrapInTransaction(function () use ($user, $now) {
            // Phase 0: guard idempotency
            if ($user->getDeletedAt() !== null) {
                return ['deletedWorkspaces' => []];
            }

            $memberships = $this->workspaceUserRepository->findActiveByUser($user);

            $deletedWorkspaces = [];
            $ownershipTransferRequired = [];

            $workspacesToDelete = [];
            $membershipsToDelete = [];

            // Phase 1: decide (NO mutations)
            foreach ($memberships as $membership) {
                $workspace = $membership->getWorkspace();

                if ($workspace->getDeletedAt() !== null) {
                    continue;
                }

                $activeMemberCount = $this->workspaceUserRepository->countActiveMembers($workspace);

                if ($membership->isOwner()) {
                    if ($activeMemberCount === 1) {
                        $workspacesToDelete[] = $workspace;
                        $membershipsToDelete[] = $membership;
                        $deletedWorkspaces[] = $workspace->getPublicId();
                        continue;
                    }

                    $ownershipTransferRequired[] = $workspace->getPublicId();
                    continue;
                }

                // Non-owner membership can always be removed
                $membershipsToDelete[] = $membership;
            }

            if (!empty($ownershipTransferRequired)) {
                // Nothing mutated yet, safe to throw
                throw new ApiException(ApiErrorCodeEnum::OWNERSHIP_TRANSFER_REQUIRED, context: array_values(array_unique($ownershipTransferRequired)));
            }

            // Phase 2: apply mutations

            // (A) Delete workspace(s) (soft)
            foreach ($workspacesToDelete as $workspace) {
                $workspace->setDeletedAt($now);
                // Optional: no need to bulk-disable EntryPoints if your resolver gates on workspace.deletedAt
            }

            // (B) Remove memberships (soft)
            foreach ($membershipsToDelete as $membership) {
                $membership->setDeletedAt($now);
            }

            // (C) Soft-delete user + tombstone identifiers (Option B)
            $this->softDeleteUserWithTombstone($user, $now);

            $this->em->flush();

            return ['deletedWorkspaces' => $deletedWorkspaces];
        });
    }

    /**
     * Soft-delete user + tombstone identifiers (Option B)
     *
     * @param User $user
     * @param DateTimeImmutable $now
     */
    private function softDeleteUserWithTombstone(User $user, DateTimeImmutable $now): void
    {
        if ($user->getDeletedAt() !== null) {
            return;
        }

        $user->setEnabled(false);

        $tombstone = $this->tombstoneEmail($user, $now);

        // IMPORTANT: both are unique in your entity
        $user->setEmail($tombstone);
        $user->setEmailCanonical($tombstone);

        $user->setDeletedAt($now);
    }

    private function tombstoneEmail(User $user, DateTimeImmutable $now): string
    {
        // Always a valid email format, always short
        return sprintf('deleted-%d-%s@dailybrew.invalid', $user->id, $now->format('YmdHis'));
    }
}

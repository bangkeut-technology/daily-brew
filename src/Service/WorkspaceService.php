<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/17/25 2:35PM
 * @see     https://adora.media
 * Copyright (c) 2025 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceUser;
use App\Enum\ApiErrorCodeEnum;
use App\Enum\WorkspaceRoleEnum;
use App\Exception\ApiException;
use App\Repository\UserRepository;
use App\Repository\WorkspaceUserRepository;
use DateTimeImmutable;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\OptimisticLockException;

/**
 *
 * Class WorkspaceService
 *
 * @package App\Service
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class WorkspaceService
{
    public function __construct(
        private EntityManagerInterface $em,
        private WorkspaceUserRepository $workspaceUserRepository,
        private UserRepository $userRepository,
    ) {}

    public function transferOwnership(Workspace $workspace, User $actor, string $targetUserPublicId): array
    {
        return $this->em->wrapInTransaction(function () use ($workspace, $actor, $targetUserPublicId) {
            $actorMembership = $this->guardOwnerAndLock($workspace, $actor);

            if ($targetUserPublicId === (string) $actor->publicId) {
                throw new ApiException(ApiErrorCodeEnum::OWNERSHIP_TRANSFER_NOT_ALLOWED, [
                    'reason' => 'cannot_transfer_to_self',
                ]);
            }

            $targetUser = $this->userRepository->findByPublicId($targetUserPublicId);
            if (!$targetUser || $targetUser->getDeletedAt() !== null) {
                throw new ApiException(ApiErrorCodeEnum::WORKSPACE_MEMBER_NOT_FOUND, [
                    'reason' => 'target_user_not_found',
                    'targetUserPublicId' => $targetUserPublicId,
                ]);
            }

            $targetMembership = $this->workspaceUserRepository->findActiveMembership($workspace, $targetUser);
            if (!$targetMembership) {
                throw new ApiException(ApiErrorCodeEnum::WORKSPACE_MEMBER_NOT_FOUND, [
                    'reason' => 'target_not_member',
                    'targetUserPublicId' => $targetUserPublicId,
                    'workspacePublicId' => $workspace->publicId,
                ]);
            }

            $actorMembership->setRole(WorkspaceRoleEnum::EMPLOYEE);
            $targetMembership->setRole(WorkspaceRoleEnum::OWNER);

            $this->em->flush();

            return ['workspace' => $workspace, 'newOwner' => $targetUser];
        });
    }

    public function deleteWorkspace(Workspace $workspace, User $actor): Workspace
    {
        return $this->em->wrapInTransaction(function () use ($workspace, $actor) {
            $now = new DateTimeImmutable();

            $membership = $this->guardOwnerAndLock($workspace, $actor);

            $otherActiveMembers = $this->workspaceUserRepository->countOtherActiveMembers($workspace, $actor);
            if ($otherActiveMembers > 0) {
                throw new ApiException(ApiErrorCodeEnum::OWNERSHIP_TRANSFER_REQUIRED, [
                    'reason' => 'workspace_is_transferable',
                    'workspacePublicId' => $workspace->publicId,
                    'otherActiveMembers' => $otherActiveMembers,
                ]);
            }

            $workspace->setDeletedAt($now);
            $membership->setDeletedAt($now);

            $this->em->flush();

            return $workspace;
        });
    }

    /**
     * @throws OptimisticLockException
     */
    private function guardOwnerAndLock(Workspace $workspace, User $actor): WorkspaceUser
    {
        if ($workspace->getDeletedAt() !== null) {
            throw new ApiException(ApiErrorCodeEnum::WORKSPACE_DELETED, [
                'workspacePublicId' => $workspace->publicId,
            ]);
        }

        $this->em->lock($workspace, LockMode::PESSIMISTIC_WRITE);

        $membership = $this->workspaceUserRepository->findActiveMembership($workspace, $actor);
        if (!$membership) {
            throw new ApiException(ApiErrorCodeEnum::FORBIDDEN, [
                'reason' => 'actor_not_member',
                'workspacePublicId' => $workspace->publicId,
            ]);
        }

        if (!$membership->isOwner()) {
            throw new ApiException(ApiErrorCodeEnum::FORBIDDEN, [
                'reason' => 'actor_not_owner',
                'workspacePublicId' => $workspace->publicId,
            ]);
        }

        return $membership;
    }
}

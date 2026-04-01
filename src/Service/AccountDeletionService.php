<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Repository\RefreshTokenRepository;
use App\Repository\WorkspaceRepository;
use Doctrine\ORM\EntityManagerInterface;

final readonly class AccountDeletionService
{
    public function __construct(
        private EntityManagerInterface  $em,
        private WorkspaceService        $workspaceService,
        private WorkspaceRepository     $workspaceRepository,
        private EmployeeRepository      $employeeRepository,
        private LeaveRequestRepository  $leaveRequestRepository,
        private RefreshTokenRepository  $refreshTokenRepository,
    ) {}

    public function softDelete(User $user): void
    {
        $now = DateService::now();

        // Revoke all refresh tokens before clearing the email
        $this->refreshTokenRepository->revokeByUsername($user->getUserIdentifier());

        // Soft-delete owned workspaces (cancels subscriptions + employees)
        $ownedWorkspaces = $this->workspaceRepository->findByOwner($user);
        foreach ($ownedWorkspaces as $workspace) {
            $this->workspaceService->delete($workspace);
        }

        // Soft-delete any remaining employees created by this user
        $this->employeeRepository->softDeleteByCreator($user, $now);

        // Unlink all employee records linked to this user
        $linkedEmployees = $this->employeeRepository->findByLinkedUser($user);
        foreach ($linkedEmployees as $linkedEmployee) {
            $linkedEmployee->setLinkedUser(null);
        }

        // Soft-delete leave requests made by this user
        $this->leaveRequestRepository->softDeleteByRequestedBy($user, $now);

        // Soft-delete the user and free up unique constraints
        $deletedSuffix = '_deleted_' . $user->getId() . '_' . time();

        $user->setEnabled(false);
        $user->setDeletedAt($now);
        $user->setCurrentWorkspace(null);
        $user->setEmail($user->getEmail() . $deletedSuffix);
        $user->setEmailCanonical($user->getEmailCanonical() . $deletedSuffix);
        $user->setGoogleId(null);
        $user->setAppleId(null);

        $this->em->flush();
    }
}

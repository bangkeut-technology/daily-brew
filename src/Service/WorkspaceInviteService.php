<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 1/6/26 10:34 AM
 *
 * @see     https://adora.media
 */

namespace App\Service;

use App\Entity\Employee;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceInvite;
use App\Enum\ApiErrorCodeEnum;
use App\Enum\WorkspaceInviteStatusEnum;
use App\Enum\WorkspaceRoleEnum;
use App\Exception\ApiException;
use App\Repository\EmployeeRepository;
use App\Repository\WorkspaceInviteRepository;
use App\Repository\WorkspaceUserRepository;
use App\Util\TokenGeneratorInterface;
use DateInterval;
use DateTimeImmutable;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 *
 * Class WorkspaceInviteService
 *
 * @package App\Service;
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class WorkspaceInviteService
{
    public function __construct(
        private TokenGeneratorInterface   $tokenGenerator,
        private WorkspaceUserRepository   $workspaceUserRepository,
        private WorkspaceInviteRepository $workspaceInviteRepository,
        private EmployeeRepository        $employeeRepository,
    )
    {
    }

    public function createInvite(
        Workspace         $workspace,
        User              $invitedBy,
        WorkspaceRoleEnum $role,
        ?string           $email,
        ?string           $employeePublicId = null,
        DateInterval      $ttl = new DateInterval('P7D'),
    ): array
    {
        $employee = null;

        if ($employeePublicId) {
            /** @var Employee|null $employee */
            $employee = $this->employeeRepository->findByPublicId($employeePublicId);
            if (!$employee) {
                throw new ApiException(ApiErrorCodeEnum::NOT_FOUND, ['employee' => 'Employee not found.']);
            }

            if ($employee->getWorkspace()?->id !== $workspace->id) {
                throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['employee' => 'Employee does not belong to this workspace.']);
            }

            // If employee is already linked to a user, block
            if (method_exists($employee, 'getLinkedUser') && $employee->getLinkedUser() !== null) {
                throw new ApiException(ApiErrorCodeEnum::CONFLICT, ['employee' => 'Employee is already linked to a user.']);
            }
        }

        $rawToken = $this->tokenGenerator->generateTokenWithoutUnderscore();

        // Store hash in DB (recommended)
        $tokenStored = hash('sha256', $rawToken);

        $invite = $this->workspaceInviteRepository->create()
            ->setWorkspace($workspace)
            ->setInvitedBy($invitedBy)
            ->setRole($role)
            ->setEmail($email)
            ->setEmployee($employee)
            ->setToken($tokenStored)
            ->setStatus(WorkspaceInviteStatusEnum::PENDING)
            ->setExpiresAt(new DateTimeImmutable()->add($ttl));

        $this->workspaceInviteRepository->update($invite);

        return ['invite' => $invite, 'rawToken' => $rawToken];
    }

    /**
     * Accept a workspace invite using the provided token and link it to the given user.
     *
     * @param string $rawToken The raw invite token provided by the user.
     * @param User   $user     The user who is accepting the invite.
     *
     * @return WorkspaceInvite The accepted workspace invite.
     */
    public function acceptInvite(string $rawToken, User $user): WorkspaceInvite
    {
        $tokenStored = hash('sha256', $rawToken);

        $invite = $this->workspaceInviteRepository->findByToken($tokenStored);

        if (!$invite) {
            throw new ApiException(ApiErrorCodeEnum::NOT_FOUND, ['invite' =>'Invite not found.']);
        }

        if (!$invite->isAcceptableNow()) {
            throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['invite' => 'Invite is not valid anymore (expired or not pending).']);
        }

        $workspace = $invite->getWorkspace();
        if (!$workspace) {
            throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['invite' => 'Invite has no workspace.']);
        }

        // Prevent duplicate membership
        $existingMembership = $this->workspaceUserRepository->findByWorkspaceAndUser($workspace, $user);

        if (!$existingMembership) {
            $membership = $this->workspaceUserRepository->create()
                ->setWorkspace($workspace)
                ->setUser($user)
                ->setRole($invite->getRole());

            $this->workspaceInviteRepository->update($membership, false);
        }

        // Link employee to user if exists
        if ($invite->getEmployee()) {
            $employee = $invite->getEmployee();

            if ($employee->getWorkspace()?->id !== $workspace->id) {
                throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['employee' => 'Employee does not belong to this workspace.']);
            }

            if (method_exists($employee, 'getLinkedUser') && $employee->getLinkedUser() !== null) {
                throw new ApiException(ApiErrorCodeEnum::CONFLICT, ['employee' => 'Employee already linked to another user.']);
            }

            if (method_exists($employee, 'setLinkedUser')) {
                $employee->setLinkedUser($user);
            } elseif (method_exists($employee, 'setUser')) {
                $employee->setUser($user);
            }
        }

        $invite->markAccepted($user);

        $this->workspaceInviteRepository->flush();

        return $invite;
    }

    /**
     * Revokes a workspace invite.
     *
     * @param WorkspaceInvite $invite The invite to revoke.

     */
    public function revokeInvite(WorkspaceInvite $invite): void
    {
        if ($invite->getStatus() !== WorkspaceInviteStatusEnum::PENDING) {
            throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['invite' => 'Only pending invites can be revoked.']);
        }

        $invite->markRevoked();
        $this->workspaceInviteRepository->flush();
    }
}

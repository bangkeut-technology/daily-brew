<?php
/**
 * This file is part of the DailyBrew project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 1/6/26 10:34 AM
 *
 * @see     https://dailybrew.work
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
use App\Repository\UserRepository;
use App\Repository\WorkspaceInviteRepository;
use App\Repository\WorkspaceUserRepository;
use App\Util\Canonicalizer;
use App\Util\TokenGeneratorInterface;
use DateInterval;
use DateTimeImmutable;

/**
 *
 * Class WorkspaceInviteService
 *
 * @package App\Service;
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class WorkspaceInviteService
{
    public function __construct(
        private TokenGeneratorInterface   $tokenGenerator,
        private WorkspaceUserRepository   $workspaceUserRepository,
        private WorkspaceInviteRepository $workspaceInviteRepository,
        private EmployeeRepository        $employeeRepository,
        private UserRepository $userRepository,
    )
    {
    }

    /**
     * Creates an invitation for a user to join a workspace.
     *
     * @param Workspace         $workspace        The workspace to which the invite applies.
     * @param User              $invitedBy        The user who initiates the invite.
     * @param WorkspaceRoleEnum $role             The role to be assigned upon accepting the invite.
     * @param string|null       $email            The email address of the user being invited.
     * @param string|null       $employeePublicId The public identifier of the employee, if applicable.
     * @param DateInterval      $ttl              Time-to-live for the invitation token, default is 7 days.
     *
     * @return array                                Contains the invite object and raw token.
     */
    public function createInvite(
        Workspace         $workspace,
        User              $invitedBy,
        WorkspaceRoleEnum $role,
        ?string           $email = null,
        ?string           $employeePublicId = null,
        DateInterval      $ttl = new DateInterval('P7D'),
    ): array
    {
        $emailCanonical = Canonicalizer::canonicalize(trim($email));
        if ($emailCanonical === '') {
            throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['email' => 'email is required.']);
        }

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

            if (method_exists($employee, 'getLinkedUser') && $employee->getLinkedUser() !== null) {
                throw new ApiException(ApiErrorCodeEnum::CONFLICT, ['employee' => 'Employee is already linked to a user.']);
            }
        }

        $invitedUser = $this->userRepository->findByIdentifier($email);

        $rawToken = $this->tokenGenerator->generateTokenWithoutUnderscore();
        $tokenStored = hash('sha256', $rawToken);

        $invite = $this->workspaceInviteRepository
            ->create()
            ->setWorkspace($workspace)
            ->setInvitedBy($invitedBy)
            ->setRole($role)
            ->setEmail($email)
            ->setEmailCanonical($emailCanonical)
            ->setEmployee($employee)
            ->setToken($tokenStored)
            ->setStatus(WorkspaceInviteStatusEnum::PENDING)
            ->setExpiresAt(new DateTimeImmutable()->add($ttl));

        // new field
        if (method_exists($invite, 'setInvitedUser')) {
            $invite->setInvitedUser($invitedUser);
        }

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

        if (null === $invite = $this->workspaceInviteRepository->findByToken($tokenStored)) {
            throw new ApiException(ApiErrorCodeEnum::NOT_FOUND, ['invite' => 'Invite not found.']);
        }

        if (!$invite->isAcceptableNow()) {
            throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['invite' => 'Invite is not valid anymore (expired or not pending).']);
        }

        if (null === $workspace = $invite->getWorkspace()) {
            throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['invite' => 'Invite has no workspace.']);
        }

        // If invite targets a specific user, enforce it
        if (method_exists($invite, 'getInvitedUser') && $invite->getInvitedUser()) {
            if ($invite->getInvitedUser()->id !== $user->id) {
                throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['invite' => 'This invite is not for your account.']);
            }
        } else {
            if ($invite->getEmailCanonical() !== $user->getEmailCanonical()) {
                throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['invite' => 'Email does not match invite.']);
            }
        }

        if (null === $this->workspaceUserRepository->findByWorkspaceAndUser($workspace, $user)) {
            $membership = $this->workspaceUserRepository->create()
                ->setWorkspace($workspace)
                ->setUser($user)
                ->setRole($invite->getRole());

            $this->workspaceUserRepository->persist($membership);
        }

        // Link employee if exists
        if (null !== $employee = $invite->getEmployee()) {
            if ($employee->getWorkspace()?->id !== $workspace->id) {
                throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['employee' => 'Employee does not belong to this workspace.']);
            }

            if (method_exists($employee, 'getLinkedUser') && $employee->getLinkedUser() !== null) {
                throw new ApiException(ApiErrorCodeEnum::CONFLICT, ['employee' => 'Employee is already linked to a user.']);
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

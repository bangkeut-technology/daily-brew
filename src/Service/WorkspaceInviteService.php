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
        ?string           $phone,
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
            ->setPhone($phone)
            ->setEmployee($employee)
            ->setToken($tokenStored)
            ->setStatus(WorkspaceInviteStatusEnum::PENDING)
            ->setExpiresAt(new DateTimeImmutable()->add($ttl));

        $this->workspaceInviteRepository->update($invite);

        return ['invite' => $invite, 'rawToken' => $rawToken];
    }
}

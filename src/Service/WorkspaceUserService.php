<?php
/**
 * This file is part of the DailyBrew project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 1/6/26 2:50 PM
 *
 * @see     https://dailybrew.work
 */

namespace App\Service;

use App\Entity\Employee;
use App\Entity\Workspace;
use App\Entity\WorkspaceUser;
use App\Enum\ApiErrorCodeEnum;
use App\Enum\WorkspaceRoleEnum;
use App\Exception\ApiException;
use App\Repository\EmployeeRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceUserRepository;

/**
 *
 * Class WorkspaceUserService
 *
 * @package App\Service
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class WorkspaceUserService
{
    public function __construct(
        private UserRepository          $userRepository,
        private WorkspaceUserRepository $workspaceUserRepository,
        private EmployeeRepository      $employeeRepository,
    ) {}

    public function addByUserPublicId(
        Workspace $workspace,
        string $userPublicId,
        WorkspaceRoleEnum $role = WorkspaceRoleEnum::EMPLOYEE,
        ?string $employeePublicId = null,
    ): WorkspaceUser {
        if (null === $targetUser = $this->userRepository->findByPublicId($userPublicId)) {
            throw new ApiException(ApiErrorCodeEnum::NOT_FOUND, ['user' => 'User not found.']);
        }

        if (null === $membership = $this->workspaceUserRepository->findByWorkspaceAndUser($workspace, $targetUser)) {
            $membership = new WorkspaceUser();
            $membership
                ->setWorkspace($workspace)
                ->setUser($targetUser)
                ->setRole($role);

            $this->workspaceUserRepository->persist($membership);
        } else {
            $membership->setRole($role);
        }

        // Optional: employee binding
        if ($employeePublicId) {
            /** @var Employee|null $employee */
            $employee = $this->employeeRepository->findByPublicId($employeePublicId);
            if (!$employee) {
                throw new ApiException(ApiErrorCodeEnum::NOT_FOUND, ['employee' => 'Employee not found.']);
            }

            if ($employee->getWorkspace()?->id !== $workspace->id) {
                throw new ApiException(ApiErrorCodeEnum::BAD_REQUEST, ['employee' => 'Employee does not belong to this workspace.']);
            }

            // Ensure employee not already linked to someone else
            if (method_exists($employee, 'getLinkedUser')) {
                $linked = $employee->getLinkedUser();
                if ($linked && $linked->id !== $targetUser->id) {
                    throw new ApiException(ApiErrorCodeEnum::CONFLICT, ['employee' => 'Employee is already linked to another user.']);
                }
                $employee->setLinkedUser($targetUser);
            } else {
                // Fallback if your Employee does not have linkedUser
                $employee->setUser($targetUser);
            }
        }

        $this->workspaceUserRepository->flush();

        return $membership;
    }
}

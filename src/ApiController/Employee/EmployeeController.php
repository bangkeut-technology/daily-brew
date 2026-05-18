<?php

declare(strict_types=1);

namespace App\ApiController\Employee;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\AttendanceDTO;
use App\DTO\EmployeeDTO;
use App\Enum\EmployeeAttendanceTrackingEnum;
use App\Enum\EmployeeRoleEnum;
use App\Enum\ManagerPermissionEnum;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\ShiftRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\EmployeeService;
use App\Service\PlanService;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/workspaces/{workspacePublicId}/employees')]
class EmployeeController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'employees_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $employees = $employeeRepository->findByWorkspace($workspace);

        return $this->jsonSuccess(array_map(fn ($e) => EmployeeDTO::fromEntity($e)->toArray(), $employees));
    }

    #[Route('', name: 'employees_create', methods: ['POST'])]
    public function create(
        string $workspacePublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        ShiftRepository $shiftRepository,
        UserRepository $userRepository,
        EmployeeService $employeeService,
        PlanService $planService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_EMPLOYEES, $workspace);

        if (!$planService->canAddEmployee($workspace)) {
            return $this->jsonError('Employee limit reached. Upgrade to Espresso for unlimited employees.', 402);
        }

        $data = json_decode($request->getContent(), true);
        $firstName = trim($data['firstName'] ?? '');
        $lastName = trim($data['lastName'] ?? '');

        if (empty($firstName) || empty($lastName)) {
            return $this->jsonError('First name and last name are required');
        }

        $existing = $employeeRepository->findDuplicate($workspace, $firstName, $lastName);
        if ($existing !== null) {
            return $this->jsonError('An employee with this name already exists', 409);
        }

        $shift = null;
        if (!empty($data['shiftPublicId'])) {
            $shift = $shiftRepository->findByPublicId($data['shiftPublicId']);
        }

        $employee = $employeeService->create(
            $workspace,
            $firstName,
            $lastName,
            $data['phoneNumber'] ?? null,
            $shift,
        );

        if (isset($data['username'])) {
            $employee->setUsername(trim($data['username']) ?: null);
        }

        if (isset($data['jobTitle'])) {
            $employee->setJobTitle(trim($data['jobTitle']) ?: null);
        }

        if (!empty($data['dob'])) {
            $employee->setDob(\App\Service\DateService::parse($data['dob']));
        }

        if (!empty($data['joinedAt'])) {
            $employee->setJoinedAt(\App\Service\DateService::parse($data['joinedAt']));
        }

        if (isset($data['attendanceTracking'])) {
            $mode = EmployeeAttendanceTrackingEnum::tryFrom((string) $data['attendanceTracking']);
            if ($mode === null) {
                return $this->jsonError('attendanceTracking must be "full" or "none"');
            }
            $employee->setAttendanceTracking($mode);
        }

        if (!empty($data['linkedUserPublicId'])) {
            $linkedUser = $userRepository->findByPublicId($data['linkedUserPublicId']);
            if ($linkedUser !== null) {
                $employeeService->linkUser($employee, $linkedUser);
            }
        }

        // Optional role at creation — owner-only and requires a linked user
        // for MANAGER (so the order matters: link first, then promote). Gated
        // by the plan's manager-limit check.
        if (isset($data['role'])) {
            $role = EmployeeRoleEnum::tryFrom((string) $data['role']);
            if ($role === null) {
                return $this->jsonError('Role must be "employee" or "manager"');
            }
            if ($role === EmployeeRoleEnum::MANAGER) {
                $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);
                if ($employee->getLinkedUser() === null) {
                    return $this->jsonError('Employee must have a linked user account to be created as manager', 400);
                }
                if (!$planService->canPromoteToManager($workspace)) {
                    $limit = $planService->getManagerLimit($workspace);
                    if ($limit === 0) {
                        return $this->jsonError('Manager role requires the Espresso plan', 402);
                    }
                    return $this->jsonError("Manager limit reached ($limit). Upgrade for more.", 402);
                }
                $employee->setRole($role);
                if (empty($employee->getManagerPermissionValues())) {
                    $employee->setManagerPermissions(ManagerPermissionEnum::defaults());
                }
            }
        }

        $employeeRepository->flush();

        return $this->jsonCreated(EmployeeDTO::fromEntity($employee)->toArray());
    }

    #[Route('/{publicId}', name: 'employees_show', methods: ['GET'])]
    public function show(
        string $workspacePublicId,
        string $publicId,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        AttendanceRepository $attendanceRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $employee = $employeeRepository->findByPublicId($publicId);
        if ($employee === null || $employee->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Employee not found');
        }

        $recentAttendance = $attendanceRepository->findByEmployee($employee, 30);
        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

        $data = EmployeeDTO::fromEntity($employee)->toArray();
        $data['attendance'] = array_map(
            fn ($a) => AttendanceDTO::fromEntity($a, tz: $tz)->toArray(),
            $recentAttendance,
        );

        return $this->jsonSuccess($data);
    }

    #[Route('/{publicId}', name: 'employees_update', methods: ['PUT'])]
    public function update(
        string $workspacePublicId,
        string $publicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        ShiftRepository $shiftRepository,
        UserRepository $userRepository,
        EmployeeService $employeeService,
        PlanService $planService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $employee = $employeeRepository->findByPublicId($publicId);
        if ($employee === null || $employee->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Employee not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $employee);

        $data = json_decode($request->getContent(), true);

        $shift = $employee->getShift();
        if (array_key_exists('shiftPublicId', $data)) {
            $shift = !empty($data['shiftPublicId']) ? $shiftRepository->findByPublicId($data['shiftPublicId']) : null;
        }

        $leftAt = null;
        if (array_key_exists('leftAt', $data) && !empty($data['leftAt'])) {
            $leftAt = \App\Service\DateService::parse($data['leftAt']);
        }

        $employee = $employeeService->update(
            $employee,
            $data['firstName'] ?? $employee->getFirstName(),
            $data['lastName'] ?? $employee->getLastName(),
            $data['phoneNumber'] ?? $employee->getPhoneNumber(),
            $shift,
            isset($data['active']) ? (bool) $data['active'] : null,
            $leftAt,
        );

        if (array_key_exists('username', $data)) {
            $employee->setUsername($data['username'] ? trim($data['username']) : null);
        }

        if (array_key_exists('jobTitle', $data)) {
            $employee->setJobTitle($data['jobTitle'] ? trim($data['jobTitle']) : null);
        }

        if (array_key_exists('dob', $data)) {
            $employee->setDob(!empty($data['dob']) ? \App\Service\DateService::parse($data['dob']) : null);
        }

        if (array_key_exists('joinedAt', $data)) {
            $employee->setJoinedAt(!empty($data['joinedAt']) ? \App\Service\DateService::parse($data['joinedAt']) : null);
        }

        if (array_key_exists('attendanceTracking', $data)) {
            $mode = EmployeeAttendanceTrackingEnum::tryFrom((string) $data['attendanceTracking']);
            if ($mode === null) {
                return $this->jsonError('attendanceTracking must be "full" or "none"');
            }
            $employee->setAttendanceTracking($mode);
        }

        // Role change — owner-only. Validates the manager limit and seeds /
        // clears default manager permissions on promotion and demotion.
        if (array_key_exists('role', $data)) {
            $role = EmployeeRoleEnum::tryFrom((string) $data['role']);
            if ($role === null) {
                return $this->jsonError('Role must be "employee" or "manager"');
            }
            $previousRole = $employee->getRole();
            if ($role !== $previousRole) {
                $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);
                if ($role === EmployeeRoleEnum::MANAGER) {
                    if ($employee->getLinkedUser() === null) {
                        return $this->jsonError('Employee must have a linked user account to be promoted to manager', 400);
                    }
                    if (!$planService->canPromoteToManager($workspace)) {
                        $limit = $planService->getManagerLimit($workspace);
                        if ($limit === 0) {
                            return $this->jsonError('Manager role requires the Espresso plan', 402);
                        }
                        return $this->jsonError("Manager limit reached ($limit). Upgrade for more.", 402);
                    }
                }
                $employee->setRole($role);
                if ($role === EmployeeRoleEnum::MANAGER && empty($employee->getManagerPermissionValues())) {
                    $employee->setManagerPermissions(ManagerPermissionEnum::defaults());
                } elseif ($role !== EmployeeRoleEnum::MANAGER) {
                    $employee->setManagerPermissions([]);
                }
            }
        }

        // Handle linking/unlinking user account
        if (array_key_exists('linkedUserPublicId', $data)) {
            if ($data['linkedUserPublicId'] === null || $data['linkedUserPublicId'] === '') {
                $employee->setLinkedUser(null);
                $employeeService->linkUser($employee, null);
            } else {
                $linkedUser = $userRepository->findByPublicId($data['linkedUserPublicId']);
                if ($linkedUser !== null) {
                    $employeeService->linkUser($employee, $linkedUser);
                } else {
                    return $this->jsonError('User not found with that public ID', 404);
                }
            }
        }

        $employeeRepository->flush();

        return $this->jsonSuccess(EmployeeDTO::fromEntity($employee)->toArray());
    }

    #[Route('/{publicId}/manager-permissions', name: 'employees_update_manager_permissions', methods: ['PATCH'])]
    public function updateManagerPermissions(
        string $workspacePublicId,
        string $publicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        // Granting capabilities to a manager is itself an owner-only operation.
        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $employee = $employeeRepository->findByPublicId($publicId);
        if ($employee === null || $employee->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Employee not found');
        }

        if (!$employee->isManager()) {
            return $this->jsonError('Only managers can have permissions assigned', 400);
        }

        $data = json_decode($request->getContent(), true);
        $raw = $data['permissions'] ?? null;
        if (!is_array($raw)) {
            return $this->jsonError('permissions must be an array of permission keys');
        }

        // Reject unknown values rather than silently dropping them.
        foreach ($raw as $value) {
            if (!is_string($value) || ManagerPermissionEnum::tryFrom($value) === null) {
                return $this->jsonError("Unknown manager permission: " . (is_string($value) ? $value : '(non-string)'));
            }
        }

        $employee->setManagerPermissions($raw);
        $employeeRepository->flush();

        return $this->jsonSuccess(EmployeeDTO::fromEntity($employee)->toArray());
    }

    #[Route('/{publicId}', name: 'employees_delete', methods: ['DELETE'])]
    public function delete(
        string $workspacePublicId,
        string $publicId,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        EmployeeService $employeeService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $employee = $employeeRepository->findByPublicId($publicId);
        if ($employee === null || $employee->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Employee not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::DELETE, $employee);

        $employeeService->delete($employee);

        return $this->jsonNoContent();
    }

}

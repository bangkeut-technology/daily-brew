<?php

declare(strict_types=1);

namespace App\ApiController\Employee;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\AttendanceDTO;
use App\DTO\EmployeeDTO;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\ShiftRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\EmployeeService;
use App\Service\PlanService;
use Doctrine\ORM\EntityManagerInterface;
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
        EntityManagerInterface $em,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

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

        if (!empty($data['dob'])) {
            $employee->setDob(new \DateTimeImmutable($data['dob']));
        }

        if (!empty($data['joinedAt'])) {
            $employee->setJoinedAt(new \DateTimeImmutable($data['joinedAt']));
        }

        if (!empty($data['linkedUserPublicId'])) {
            $linkedUser = $userRepository->findByPublicId($data['linkedUserPublicId']);
            if ($linkedUser !== null) {
                $employeeService->linkUser($employee, $linkedUser);
            }
        }

        $em->flush();

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

        $data = EmployeeDTO::fromEntity($employee)->toArray();
        $data['attendance'] = array_map(
            fn ($a) => AttendanceDTO::fromEntity($a)->toArray(),
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
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $employee = $employeeRepository->findByPublicId($publicId);
        if ($employee === null || $employee->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Employee not found');
        }

        $data = json_decode($request->getContent(), true);

        $shift = $employee->getShift();
        if (array_key_exists('shiftPublicId', $data)) {
            $shift = !empty($data['shiftPublicId']) ? $shiftRepository->findByPublicId($data['shiftPublicId']) : null;
        }

        $employee = $employeeService->update(
            $employee,
            $data['firstName'] ?? $employee->getFirstName(),
            $data['lastName'] ?? $employee->getLastName(),
            $data['phoneNumber'] ?? $employee->getPhoneNumber(),
            $shift,
            isset($data['active']) ? (bool) $data['active'] : null,
        );

        if (array_key_exists('username', $data)) {
            $employee->setUsername($data['username'] ? trim($data['username']) : null);
        }

        if (array_key_exists('dob', $data)) {
            $employee->setDob(!empty($data['dob']) ? new \DateTimeImmutable($data['dob']) : null);
        }

        if (array_key_exists('joinedAt', $data)) {
            $employee->setJoinedAt(!empty($data['joinedAt']) ? new \DateTimeImmutable($data['joinedAt']) : null);
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

        $this->denyAccessUnlessGranted(WorkspaceVoter::DELETE, $workspace);

        $employee = $employeeRepository->findByPublicId($publicId);
        if ($employee === null || $employee->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Employee not found');
        }

        $employeeService->delete($employee);

        return $this->jsonNoContent();
    }

}

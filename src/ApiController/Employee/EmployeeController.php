<?php

namespace App\ApiController\Employee;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\ShiftRepository;
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

        return $this->jsonSuccess(array_map(fn ($e) => [
            'publicId' => (string) $e->getPublicId(),
            'name' => $e->getName(),
            'phone' => $e->getPhone(),
            'active' => $e->isActive(),
            'qrToken' => $e->getQrToken(),
            'shiftName' => $e->getShift()?->getName(),
            'shiftPublicId' => $e->getShift() ? (string) $e->getShift()->getPublicId() : null,
            'createdAt' => $e->getCreatedAt()->format('c'),
        ], $employees));
    }

    #[Route('', name: 'employees_create', methods: ['POST'])]
    public function create(
        string $workspacePublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        ShiftRepository $shiftRepository,
        EmployeeService $employeeService,
        PlanService $planService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        if (!$planService->canAddEmployee($workspace)) {
            return $this->jsonError(
                'Employee limit reached. Upgrade to Brew+ for unlimited employees.',
                402
            );
        }

        $data = json_decode($request->getContent(), true);
        $name = $data['name'] ?? '';

        if (empty($name)) {
            return $this->jsonError('Name is required');
        }

        $shift = null;
        if (!empty($data['shiftPublicId'])) {
            $shift = $shiftRepository->findByPublicId($data['shiftPublicId']);
        }

        $employee = $employeeService->create($workspace, $name, $data['phone'] ?? null, $shift);

        return $this->jsonCreated([
            'publicId' => (string) $employee->getPublicId(),
            'name' => $employee->getName(),
            'phone' => $employee->getPhone(),
            'qrToken' => $employee->getQrToken(),
            'active' => $employee->isActive(),
            'shiftName' => $employee->getShift()?->getName(),
        ]);
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
        if ($employee === null || $employee->getWorkspace()->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Employee not found');
        }

        $recentAttendance = $attendanceRepository->findByEmployee($employee, 30);

        return $this->jsonSuccess([
            'publicId' => (string) $employee->getPublicId(),
            'name' => $employee->getName(),
            'phone' => $employee->getPhone(),
            'active' => $employee->isActive(),
            'qrToken' => $employee->getQrToken(),
            'shiftName' => $employee->getShift()?->getName(),
            'shiftPublicId' => $employee->getShift() ? (string) $employee->getShift()->getPublicId() : null,
            'createdAt' => $employee->getCreatedAt()->format('c'),
            'attendance' => array_map(fn ($a) => [
                'publicId' => (string) $a->getPublicId(),
                'date' => $a->getDate()->format('Y-m-d'),
                'checkInAt' => $a->getCheckInAt()?->format('H:i'),
                'checkOutAt' => $a->getCheckOutAt()?->format('H:i'),
                'isLate' => $a->isLate(),
                'leftEarly' => $a->hasLeftEarly(),
            ], $recentAttendance),
        ]);
    }

    #[Route('/{publicId}', name: 'employees_update', methods: ['PUT'])]
    public function update(
        string $workspacePublicId,
        string $publicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        ShiftRepository $shiftRepository,
        EmployeeService $employeeService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $employee = $employeeRepository->findByPublicId($publicId);
        if ($employee === null || $employee->getWorkspace()->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Employee not found');
        }

        $data = json_decode($request->getContent(), true);
        $name = $data['name'] ?? $employee->getName();

        $shift = $employee->getShift();
        if (array_key_exists('shiftPublicId', $data)) {
            $shift = !empty($data['shiftPublicId']) ? $shiftRepository->findByPublicId($data['shiftPublicId']) : null;
        }

        $employee = $employeeService->update(
            $employee,
            $name,
            $data['phone'] ?? $employee->getPhone(),
            $shift,
            isset($data['active']) ? (bool) $data['active'] : null,
        );

        return $this->jsonSuccess([
            'publicId' => (string) $employee->getPublicId(),
            'name' => $employee->getName(),
            'phone' => $employee->getPhone(),
            'active' => $employee->isActive(),
            'shiftName' => $employee->getShift()?->getName(),
        ]);
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
        if ($employee === null || $employee->getWorkspace()->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Employee not found');
        }

        $employeeService->delete($employee);

        return $this->jsonNoContent();
    }
}

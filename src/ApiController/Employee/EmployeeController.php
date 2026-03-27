<?php

declare(strict_types=1);

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

        return $this->jsonSuccess(array_map(fn ($e) => $this->serializeEmployee($e), $employees));
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
            return $this->jsonError('Employee limit reached. Upgrade to Espresso for unlimited employees.', 402);
        }

        $data = json_decode($request->getContent(), true);
        $firstName = $data['firstName'] ?? '';
        $lastName = $data['lastName'] ?? '';

        if (empty($firstName) || empty($lastName)) {
            return $this->jsonError('First name and last name are required');
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

        return $this->jsonCreated($this->serializeEmployee($employee));
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

        $data = $this->serializeEmployee($employee);
        $data['attendance'] = array_map(fn ($a) => [
            'publicId' => (string) $a->getPublicId(),
            'date' => $a->getDate()->format('Y-m-d'),
            'checkInAt' => $a->getCheckInAt()?->format('H:i'),
            'checkOutAt' => $a->getCheckOutAt()?->format('H:i'),
            'isLate' => $a->isLate(),
            'leftEarly' => $a->hasLeftEarly(),
        ], $recentAttendance);

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

        return $this->jsonSuccess($this->serializeEmployee($employee));
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

    private function serializeEmployee(\App\Entity\Employee $e): array
    {
        return [
            'publicId' => (string) $e->getPublicId(),
            'firstName' => $e->getFirstName(),
            'lastName' => $e->getLastName(),
            'name' => $e->getName(),
            'phoneNumber' => $e->getPhoneNumber(),
            'active' => $e->isActive(),
            'linkedUserPublicId' => $e->getLinkedUser() ? (string) $e->getLinkedUser()->getPublicId() : null,
            'linkedUserEmail' => $e->getLinkedUser()?->getEmail(),
            'shiftName' => $e->getShift()?->getName(),
            'shiftPublicId' => $e->getShift() ? (string) $e->getShift()->getPublicId() : null,
            'createdAt' => $e->getCreatedAt()->format('c'),
        ];
    }
}

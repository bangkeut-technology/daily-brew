<?php

declare(strict_types=1);

namespace App\ApiController;

use App\Controller\AbstractController;
use App\Entity\Attendance;
use App\Enum\ApiErrorCodeEnum;
use App\Enum\AttendanceTypeEnum;
use App\Enum\LeaveRequestStatusEnum;
use App\Form\LeaveRequestFormType;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeEvaluationRepository;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\LeaveRequestService;
use App\Service\ShiftAttendanceService;
use DateTimeImmutable;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class MeController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/me', name: 'me_')]
#[OA\Tag(name: 'Employee Self-Service')]
class MeController extends AbstractController
{
    public function __construct(
        TranslatorInterface                           $translator,
        private readonly EmployeeRepository           $employeeRepository,
        private readonly AttendanceRepository         $attendanceRepository,
        private readonly EmployeeEvaluationRepository $evaluationRepository,
        private readonly LeaveRequestRepository       $leaveRequestRepository,
        private readonly ShiftAttendanceService       $shiftAttendanceService,
    )
    {
        parent::__construct($translator);
    }

    // ── Attendance ──────────────────────────────────────────────────────────

    #[Route('/attendance', name: 'attendance_list', methods: ['GET'])]
    public function attendanceList(): JsonResponse
    {
        $employee = $this->resolveEmployee();

        $attendances = $this->attendanceRepository->findBy(
            ['employee' => $employee, 'deletedAt' => null],
            ['attendanceDate' => 'DESC']
        );

        return $this->json($attendances, Response::HTTP_OK, [], ['groups' => ['attendance:read']]);
    }

    #[Route('/attendance/check-in', name: 'attendance_check_in', methods: ['POST'])]
    public function checkIn(): JsonResponse
    {
        $employee = $this->resolveEmployee();
        $today = new DateTimeImmutable('today');

        if ($this->attendanceRepository->existsForEmployeeOnDay($employee, $today)) {
            return $this->json(['message' => 'Already checked in today.'], Response::HTTP_CONFLICT);
        }

        $clockIn = new DateTimeImmutable();
        $type    = $this->shiftAttendanceService->detectCheckInType($employee, $clockIn);

        $attendance = $this->attendanceRepository->create()
            ->setEmployee($employee)
            ->setWorkspace($employee->getWorkspace())
            ->setAttendanceDate($today)
            ->setClockIn($clockIn)
            ->setType($type)
            ->setUser($this->getUser());
        $this->attendanceRepository->update($attendance);

        return $this->json($attendance, Response::HTTP_CREATED, [], ['groups' => ['attendance:read']]);
    }

    #[Route('/attendance/check-out', name: 'attendance_check_out', methods: ['POST'])]
    public function checkOut(): JsonResponse
    {
        $employee = $this->resolveEmployee();
        $today = new DateTimeImmutable('today');

        $attendance = $this->attendanceRepository->findOneBy([
            'employee'       => $employee,
            'attendanceDate' => $today,
            'deletedAt'      => null,
        ]);

        if (null === $attendance) {
            return $this->json(['message' => 'No check-in found for today.'], Response::HTTP_NOT_FOUND);
        }

        if (null !== $attendance->getClockOut()) {
            return $this->json(['message' => 'Already checked out today.'], Response::HTTP_CONFLICT);
        }

        $clockOut    = new DateTimeImmutable();
        $updatedType = $this->shiftAttendanceService->detectCheckOutType($employee, $clockOut, $attendance->getType());

        $attendance->setClockOut($clockOut)->setType($updatedType);
        $this->attendanceRepository->update($attendance);

        return $this->json($attendance, Response::HTTP_OK, [], ['groups' => ['attendance:read']]);
    }

    // ── Evaluations ─────────────────────────────────────────────────────────

    #[Route('/evaluations', name: 'evaluations_list', methods: ['GET'])]
    public function evaluationsList(): JsonResponse
    {
        $employee = $this->resolveEmployee();

        $evaluations = $this->evaluationRepository->findBy(
            ['employee' => $employee],
            ['evaluatedAt' => 'DESC']
        );

        return $this->json($evaluations, Response::HTTP_OK, [], ['groups' => ['employee_evaluation:read']]);
    }

    // ── Leave Requests ───────────────────────────────────────────────────────

    #[Route('/leave-requests', name: 'leave_requests_list', methods: ['GET'])]
    public function leaveRequestsList(): JsonResponse
    {
        $employee = $this->resolveEmployee();

        $requests = $this->leaveRequestRepository->findByEmployee($employee);

        return $this->json($requests, Response::HTTP_OK, [], ['groups' => ['leave_request:read']]);
    }

    #[Route('/leave-requests', name: 'leave_requests_create', methods: ['POST'])]
    public function createLeaveRequest(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee();

        $leaveRequest = $this->leaveRequestRepository->create();
        $leaveRequest->setEmployee($employee);
        $leaveRequest->setWorkspace($employee->getWorkspace());
        $leaveRequest->setRequestedBy($this->getUser());

        $form = $this->createForm(LeaveRequestFormType::class, $leaveRequest);
        $form->submit($request->getPayload()->all());

        if ($form->isSubmitted() && $form->isValid()) {
            $this->leaveRequestRepository->update($leaveRequest);

            return $this->json($leaveRequest, Response::HTTP_CREATED, [], ['groups' => ['leave_request:read']]);
        }

        return $this->createFormErrorsResponse($form);
    }

    #[Route('/leave-requests/{requestPublicId}', name: 'leave_requests_cancel', methods: ['DELETE'])]
    public function cancelLeaveRequest(string $requestPublicId): JsonResponse
    {
        $employee = $this->resolveEmployee();

        $leaveRequest = $this->leaveRequestRepository->findByPublicIdAndEmployee($requestPublicId, $employee);
        if (null === $leaveRequest) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $requestPublicId]);
        }

        if ($leaveRequest->getStatus() !== LeaveRequestStatusEnum::PENDING) {
            return $this->json(['message' => 'Only pending requests can be cancelled.'], Response::HTTP_CONFLICT);
        }

        $leaveRequest->setDeletedAt(new DateTimeImmutable());
        $this->leaveRequestRepository->update($leaveRequest);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private function resolveEmployee(): \App\Entity\Employee
    {
        $employee = $this->employeeRepository->findByLinkedUser($this->getUser());
        if (null === $employee) {
            throw $this->createAccessDeniedException('No employee profile linked to this account.');
        }

        return $employee;
    }
}

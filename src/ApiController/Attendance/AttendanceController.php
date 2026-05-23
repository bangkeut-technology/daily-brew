<?php

namespace App\ApiController\Attendance;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\AttendanceDTO;
use App\Entity\Employee;
use App\Entity\User;
use App\Enum\ManagerPermissionEnum;
use App\Exception\AttendanceAlreadyExistsException;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\AttendanceService;
use App\Service\DateService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/workspaces/{workspacePublicId}/attendances')]
class AttendanceController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'attendances_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        AttendanceRepository $attendanceRepository,
        EmployeeRepository $employeeRepository,
        LeaveRequestRepository $leaveRequestRepository,
        ClosurePeriodRepository $closurePeriodRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $from = $request->query->get('from', DateService::today($wsTz)->format('Y-m-d'));
        $to = $request->query->get('to', $from);
        $wsTodayStr = DateService::today($wsTz)->format('Y-m-d');

        $fromDate = DateService::parse($from);
        $toDate = DateService::parse($to);

        // Determine role
        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $employee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $canSeeAll = $isOwner || ($employee?->hasManagerPermission(ManagerPermissionEnum::MANAGE_ATTENDANCE) ?? false);

        // Include employees whose active window overlaps the queried range —
        // i.e. still active, or deactivated on/after `from`. This keeps
        // historical absent/present rows visible for deactivated staff.
        $activeEmployees = $employeeRepository->findActiveDuringRangeByWorkspace($workspace, $fromDate);
        if (!$canSeeAll && $employee !== null) {
            $empId = $employee->getId();
            $activeEmployees = array_filter($activeEmployees, fn ($e) => $e->getId() === $empId);
        }

        // Bulk-load attendance, leaves, and closures
        $attendances = $attendanceRepository->findByWorkspaceAndDateRange(
            $workspace,
            DateService::mutableParse($from),
            DateService::mutableParse($to),
        );

        $approvedLeaves = $leaveRequestRepository->findApprovedByWorkspaceAndDateRange(
            $workspace, $fromDate, $toDate,
        );

        $closures = $closurePeriodRepository->findAllOverlappingRange(
            $workspace, $fromDate, $toDate,
        );

        // Time formatter
        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $formatTime = static function (?\DateTimeInterface $dt) use ($tz): ?string {
            if ($dt === null) return null;
            return \DateTimeImmutable::createFromInterface($dt)->setTimezone($tz)->format('H:i');
        };

        // Index attendance by "employeeId_date"
        $attendanceMap = [];
        foreach ($attendances as $a) {
            $key = $a->getEmployee()->getId() . '_' . $a->getDate()->format('Y-m-d');
            $attendanceMap[$key] = $a;
        }

        // Build closure dates set
        $closureDates = [];
        foreach ($closures as $c) {
            $period = new \DatePeriod(
                \DateTimeImmutable::createFromInterface($c->getStartDate()),
                new \DateInterval('P1D'),
                \DateTimeImmutable::createFromInterface($c->getEndDate())->modify('+1 day'),
            );
            foreach ($period as $d) {
                $closureDates[$d->format('Y-m-d')] = true;
            }
        }

        // Index leaves by employee ID
        $leaveMap = [];
        foreach ($approvedLeaves as $lr) {
            $leaveMap[$lr->getEmployee()->getId()][] = $lr;
        }

        // Build result with present, absent, and on_leave records
        $result = [];
        $datePeriod = new \DatePeriod($fromDate, new \DateInterval('P1D'), $toDate->modify('+1 day'));

        foreach ($datePeriod as $date) {
            $dateStr = $date->format('Y-m-d');
            $isClosure = isset($closureDates[$dateStr]);
            $isFuture = $dateStr > $wsTodayStr;

            foreach ($activeEmployees as $emp) {
                // Skip days after the employee's last working day so deactivated
                // staff stop appearing on dates they weren't employed.
                $leftAt = $emp->getLeftAt()?->format('Y-m-d');
                if ($leftAt !== null && $dateStr > $leftAt) {
                    continue;
                }

                $key = $emp->getId() . '_' . $dateStr;

                if (isset($attendanceMap[$key])) {
                    $a = $attendanceMap[$key];
                    $result[] = [
                        'publicId' => (string) $a->getPublicId(),
                        'employeePublicId' => (string) $emp->getPublicId(),
                        'employeeName' => $emp->getName(),
                        'shiftName' => $emp->getShift()?->getName(),
                        'date' => $dateStr,
                        'checkInAt' => $formatTime($a->getCheckInAt()),
                        'checkOutAt' => $formatTime($a->getCheckOutAt()),
                        'isLate' => $a->isLate(),
                        'leftEarly' => $a->hasLeftEarly(),
                        'status' => 'present',
                        'editedAt' => $a->getEditedAt()?->format(\DateTimeInterface::ATOM),
                        'editedByEmail' => $a->getEditedByEmail(),
                        'editReason' => $a->getEditReason(),
                        'originalCheckInAt' => $formatTime($a->getOriginalCheckInAt()),
                        'originalCheckOutAt' => $formatTime($a->getOriginalCheckOutAt()),
                    ];
                } elseif (!$isClosure && !$isFuture) {
                    // Check if on approved leave
                    $onLeave = false;
                    $empLeaves = $leaveMap[$emp->getId()] ?? [];
                    foreach ($empLeaves as $lr) {
                        if ($lr->getStartDate()->format('Y-m-d') <= $dateStr
                            && $lr->getEndDate()->format('Y-m-d') >= $dateStr) {
                            $onLeave = true;
                            break;
                        }
                    }

                    $status = $onLeave ? 'on_leave' : 'absent';
                    $result[] = [
                        'publicId' => $status . '-' . $emp->getPublicId() . '-' . $dateStr,
                        'employeePublicId' => (string) $emp->getPublicId(),
                        'employeeName' => $emp->getName(),
                        'shiftName' => $emp->getShift()?->getName(),
                        'date' => $dateStr,
                        'checkInAt' => null,
                        'checkOutAt' => null,
                        'isLate' => false,
                        'leftEarly' => false,
                        'status' => $status,
                    ];
                }
            }
        }

        // Sort: date DESC, then status (present > on_leave > absent), then name ASC
        $statusOrder = ['present' => 0, 'on_leave' => 1, 'absent' => 2];
        usort($result, static function (array $a, array $b) use ($statusOrder): int {
            $dateCmp = $b['date'] <=> $a['date'];
            if ($dateCmp !== 0) return $dateCmp;
            $statusCmp = ($statusOrder[$a['status']] ?? 3) <=> ($statusOrder[$b['status']] ?? 3);
            if ($statusCmp !== 0) return $statusCmp;
            return $a['employeeName'] <=> $b['employeeName'];
        });

        return $this->jsonSuccess($result);
    }

    /**
     * Monthly attendance summary: returns per-employee, per-day status
     * so owners can see which employees were absent on which days.
     */
    #[Route('/summary', name: 'attendances_summary', methods: ['GET'])]
    public function summary(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        AttendanceRepository $attendanceRepository,
        EmployeeRepository $employeeRepository,
        LeaveRequestRepository $leaveRequestRepository,
        ClosurePeriodRepository $closurePeriodRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $from = $request->query->get('from', DateService::today($wsTz)->format('Y-m-d'));
        $to = $request->query->get('to', $from);

        $fromDate = DateService::mutableParse($from);
        $toDate = DateService::mutableParse($to);

        // Determine which employees to include
        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $selfEmployee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $canSeeAll = $isOwner || ($selfEmployee?->hasManagerPermission(ManagerPermissionEnum::MANAGE_ATTENDANCE) ?? false);

        if (!$canSeeAll) {
            // Viewer sees only their own summary
            $employees = $selfEmployee !== null ? [$selfEmployee] : [];
        } else {
            // See note in list(): include deactivated employees whose active
            // window overlaps the queried range so history is preserved.
            $employees = $employeeRepository->findActiveDuringRangeByWorkspace(
                $workspace,
                \DateTimeImmutable::createFromMutable($fromDate),
            );
        }

        if (empty($employees)) {
            return $this->jsonSuccess([]);
        }

        // Index attendance records by (employeeId, date)
        $attendances = $attendanceRepository->findByWorkspaceAndDateRange($workspace, $fromDate, $toDate);
        $attendanceMap = [];
        foreach ($attendances as $a) {
            $key = $a->getEmployee()->getId() . '_' . $a->getDate()->format('Y-m-d');
            $attendanceMap[$key] = $a;
        }

        // Collect closure dates in range
        $closureDates = [];
        $closures = $closurePeriodRepository->findByWorkspace($workspace);
        foreach ($closures as $closure) {
            $cStart = max($fromDate->getTimestamp(), $closure->getStartDate()->getTimestamp());
            $cEnd = min($toDate->getTimestamp(), $closure->getEndDate()->getTimestamp());
            $current = new \DateTime('@' . $cStart);
            $end = new \DateTime('@' . $cEnd);
            while ($current <= $end) {
                $closureDates[$current->format('Y-m-d')] = true;
                $current->modify('+1 day');
            }
        }

        // Collect approved leaves indexed by (employeeId, date)
        $leaveMap = [];
        foreach ($employees as $emp) {
            $leaves = $leaveRequestRepository->findApprovedInRange($emp, $fromDate, $toDate);
            foreach ($leaves as $leave) {
                $lStart = max($fromDate->getTimestamp(), $leave->getStartDate()->getTimestamp());
                $lEnd = min($toDate->getTimestamp(), $leave->getEndDate()->getTimestamp());
                $current = new \DateTime('@' . $lStart);
                $end = new \DateTime('@' . $lEnd);
                while ($current <= $end) {
                    $leaveMap[$emp->getId() . '_' . $current->format('Y-m-d')] = $leave;
                    $current->modify('+1 day');
                }
            }
        }

        $formatTime = static function (?\DateTimeInterface $dt) use ($wsTz): ?string {
            if ($dt === null) return null;
            return \DateTimeImmutable::createFromInterface($dt)->setTimezone($wsTz)->format('H:i');
        };

        $wsTodayStr = DateService::today($wsTz)->format('Y-m-d');

        $result = [];
        foreach ($employees as $emp) {
            $leftAtStr = $emp->getLeftAt()?->format('Y-m-d');
            $days = [];
            $period = new \DatePeriod($fromDate, new \DateInterval('P1D'), (clone $toDate)->modify('+1 day'));
            foreach ($period as $day) {
                $dateStr = $day->format('Y-m-d');
                $key = $emp->getId() . '_' . $dateStr;

                // Past employee's last working day — omit so they don't show
                // absent/upcoming for dates they weren't employed.
                if ($leftAtStr !== null && $dateStr > $leftAtStr) {
                    continue;
                }

                if (isset($closureDates[$dateStr])) {
                    $days[] = ['date' => $dateStr, 'status' => 'closure'];
                    continue;
                }

                if (isset($leaveMap[$key])) {
                    $leave = $leaveMap[$key];
                    $days[] = [
                        'date' => $dateStr,
                        'status' => 'leave',
                        'leaveType' => $leave->getType()->value,
                    ];
                    continue;
                }

                if (isset($attendanceMap[$key])) {
                    $a = $attendanceMap[$key];
                    if ($a->getCheckInAt() !== null) {
                        $days[] = [
                            'date' => $dateStr,
                            'status' => 'present',
                            'attendancePublicId' => (string) $a->getPublicId(),
                            'checkInAt' => $formatTime($a->getCheckInAt()),
                            'checkOutAt' => $formatTime($a->getCheckOutAt()),
                            'isLate' => $a->isLate(),
                            'leftEarly' => $a->hasLeftEarly(),
                            'editedAt' => $a->getEditedAt()?->format(\DateTimeInterface::ATOM),
                            'editedByEmail' => $a->getEditedByEmail(),
                            'editReason' => $a->getEditReason(),
                            'originalCheckInAt' => $formatTime($a->getOriginalCheckInAt()),
                            'originalCheckOutAt' => $formatTime($a->getOriginalCheckOutAt()),
                        ];
                        continue;
                    }
                }

                // Future dates are not yet absent
                if ($dateStr > $wsTodayStr) {
                    $days[] = ['date' => $dateStr, 'status' => 'upcoming'];
                } else {
                    $days[] = ['date' => $dateStr, 'status' => 'absent'];
                }
            }

            $result[] = [
                'employeePublicId' => (string) $emp->getPublicId(),
                'employeeName' => $emp->getName(),
                'shiftName' => $emp->getShift()?->getName(),
                'days' => $days,
            ];
        }

        return $this->jsonSuccess($result);
    }

    /**
     * Manager/owner override for an existing attendance record. Used to close
     * forgotten check-outs and fix typo'd scan times. Originals are snapshotted
     * on first edit so the raw scan data is never lost.
     */
    #[Route('/{publicId}', name: 'attendances_update', methods: ['PATCH'])]
    public function update(
        string $workspacePublicId,
        string $publicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        AttendanceRepository $attendanceRepository,
        AttendanceService $attendanceService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $attendance = $attendanceRepository->findByPublicId($publicId);
        if ($attendance === null || $attendance->getEmployee()?->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Attendance not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $attendance);

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->jsonError('Invalid JSON body');
        }

        $checkInProvided = array_key_exists('checkInAt', $data);
        $checkOutProvided = array_key_exists('checkOutAt', $data);
        $reason = is_string($data['reason'] ?? null) ? $data['reason'] : '';

        $checkIn = $data['checkInAt'] ?? null;
        $checkOut = $data['checkOutAt'] ?? null;
        if ($checkIn !== null && !is_string($checkIn)) {
            return $this->jsonError('checkInAt must be a HH:MM string or null');
        }
        if ($checkOut !== null && !is_string($checkOut)) {
            return $this->jsonError('checkOutAt must be a HH:MM string or null');
        }

        $attendanceService->override(
            attendance: $attendance,
            actor: $user,
            checkInAt: $checkIn,
            checkOutAt: $checkOut,
            checkInProvided: $checkInProvided,
            checkOutProvided: $checkOutProvided,
            reason: $reason,
        );

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        return $this->jsonSuccess(AttendanceDTO::fromEntity($attendance, includeEmployee: true, tz: $wsTz)->toArray());
    }

    /**
     * Manually record an attendance row (backfill a forgotten scan or a broken-QR
     * day). Owner or a manager with `manage_attendance`. If a row already exists
     * for that employee/date, returns 409 with the existing record so the client
     * can switch to editing it.
     */
    #[Route('', name: 'attendances_create', methods: ['POST'])]
    public function create(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        AttendanceService $attendanceService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_ATTENDANCES, $workspace);

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->jsonError('Invalid JSON body');
        }

        $employeePublicId = is_string($data['employeePublicId'] ?? null) ? $data['employeePublicId'] : '';
        $date = is_string($data['date'] ?? null) ? $data['date'] : '';
        $reason = is_string($data['reason'] ?? null) ? $data['reason'] : '';

        $checkIn = $data['checkInAt'] ?? null;
        $checkOut = $data['checkOutAt'] ?? null;
        if ($checkIn !== null && !is_string($checkIn)) {
            return $this->jsonError('checkInAt must be a HH:MM string or null');
        }
        if ($checkOut !== null && !is_string($checkOut)) {
            return $this->jsonError('checkOutAt must be a HH:MM string or null');
        }

        $employee = $employeeRepository->findByPublicId($employeePublicId);
        if (!$employee instanceof Employee
            || $employee->getWorkspace()?->getId() !== $workspace->getId()
            || $employee->getDeletedAt() !== null) {
            throw new NotFoundHttpException('Employee not found');
        }

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

        try {
            $attendance = $attendanceService->create(
                workspace: $workspace,
                employee: $employee,
                actor: $user,
                date: $date,
                checkInAt: $checkIn,
                checkOutAt: $checkOut,
                reason: $reason,
            );
        } catch (AttendanceAlreadyExistsException $e) {
            return new JsonResponse([
                'error' => true,
                'message' => $e->getMessage(),
                'code' => 409,
                'existing' => AttendanceDTO::fromEntity($e->existing, includeEmployee: true, tz: $wsTz)->toArray(),
            ], 409);
        }

        return $this->jsonCreated(AttendanceDTO::fromEntity($attendance, includeEmployee: true, tz: $wsTz)->toArray());
    }
}

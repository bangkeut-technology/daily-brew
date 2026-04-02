<?php

namespace App\ApiController\Attendance;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
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
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $from = $request->query->get('from', (new \DateTime('now', new \DateTimeZone('UTC')))->format('Y-m-d'));
        $to = $request->query->get('to', $from);

        $attendances = $attendanceRepository->findByWorkspaceAndDateRange(
            $workspace,
            new \DateTime($from),
            new \DateTime($to),
        );

        // Owners and managers see all attendance; employees see only their own
        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $employee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $isManager = $employee?->isManager() ?? false;
        if (!$isOwner && !$isManager) {
            if ($employee !== null) {
                $employeeId = $employee->getId();
                $attendances = array_filter($attendances, fn ($a) => $a->getEmployee()->getId() === $employeeId);
            }
        }

        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $formatTime = static function (?\DateTimeInterface $dt) use ($tz): ?string {
            if ($dt === null) return null;
            return \DateTimeImmutable::createFromInterface($dt)->setTimezone($tz)->format('H:i');
        };

        return $this->jsonSuccess(array_values(array_map(fn ($a) => [
            'publicId' => (string) $a->getPublicId(),
            'employeePublicId' => (string) $a->getEmployee()->getPublicId(),
            'employeeName' => $a->getEmployee()->getName(),
            'shiftName' => $a->getEmployee()->getShift()?->getName(),
            'date' => $a->getDate()->format('Y-m-d'),
            'checkInAt' => $formatTime($a->getCheckInAt()),
            'checkOutAt' => $formatTime($a->getCheckOutAt()),
            'isLate' => $a->isLate(),
            'leftEarly' => $a->hasLeftEarly(),
        ], $attendances)));
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

        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $from = $request->query->get('from', (new \DateTime('now', $tz))->format('Y-m-d'));
        $to = $request->query->get('to', $from);

        $fromDate = new \DateTime($from, $tz);
        $toDate = new \DateTime($to, $tz);

        // Determine which employees to include
        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $selfEmployee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $isManager = $selfEmployee?->isManager() ?? false;

        if (!$isOwner && !$isManager) {
            // Employee sees only their own summary
            $employees = $selfEmployee !== null ? [$selfEmployee] : [];
        } else {
            $employees = $employeeRepository->findActiveByWorkspace($workspace);
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

        $formatTime = static function (?\DateTimeInterface $dt) use ($tz): ?string {
            if ($dt === null) return null;
            return \DateTimeImmutable::createFromInterface($dt)->setTimezone($tz)->format('H:i');
        };

        $today = new \DateTimeImmutable('today', $tz);

        $result = [];
        foreach ($employees as $emp) {
            $days = [];
            $period = new \DatePeriod($fromDate, new \DateInterval('P1D'), (clone $toDate)->modify('+1 day'));
            foreach ($period as $day) {
                $dateStr = $day->format('Y-m-d');
                $key = $emp->getId() . '_' . $dateStr;

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
                            'checkInAt' => $formatTime($a->getCheckInAt()),
                            'checkOutAt' => $formatTime($a->getCheckOutAt()),
                            'isLate' => $a->isLate(),
                            'leftEarly' => $a->hasLeftEarly(),
                        ];
                        continue;
                    }
                }

                // Future dates are not yet absent
                if (new \DateTimeImmutable($dateStr, $tz) > $today) {
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
}

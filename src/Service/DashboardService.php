<?php

declare(strict_types=1);

namespace App\Service;

use App\DTO\AttendanceDTO;
use App\Entity\Workspace;
use App\Enum\DayOfWeekEnum;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;

final readonly class DashboardService
{
    public function __construct(
        private EmployeeRepository     $employeeRepository,
        private AttendanceRepository   $attendanceRepository,
        private LeaveRequestRepository $leaveRequestRepository,
        private PlanService            $planService,
    ) {}

    public function getTodayStats(Workspace $workspace): array
    {
        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $today = DateService::today($tz);
        // Seat-limit count — includes attendanceTracking=None employees.
        $totalActive = $this->employeeRepository->countActiveByWorkspace($workspace);
        // Absent-calc baseline — excludes None-tracked employees so they're never absent,
        // AND (Espresso+) excludes employees whose shift is off-duty today, so a Mon-Fri
        // GM doesn't show up as absent on Saturday.
        $dayOfWeek = DayOfWeekEnum::tryFrom((int) $today->format('N'));
        $totalTracked = $dayOfWeek !== null && $this->planService->canUseShiftTimeRules($workspace)
            ? $this->employeeRepository->countAttendanceTrackedAndScheduledOn($workspace, $dayOfWeek)
            : $this->employeeRepository->countAttendanceTrackedByWorkspace($workspace);
        $presentCount = $this->attendanceRepository->countByWorkspaceAndDate($workspace, $today);
        $lateCount = $this->attendanceRepository->countLateByWorkspaceAndDate($workspace, $today);
        $onLeaveCount = $this->leaveRequestRepository->countApprovedByWorkspaceAndDate($workspace, $today);
        $absentCount = max(0, $totalTracked - $presentCount - $onLeaveCount);

        $recentAttendance = $this->attendanceRepository->findByWorkspaceAndDate($workspace, $today);
        $pendingLeaves = $this->leaveRequestRepository->countPendingByWorkspace($workspace);

        return [
            'totalEmployees' => $totalActive,
            'present' => $presentCount,
            'late' => $lateCount,
            'onLeave' => $onLeaveCount,
            'absent' => $absentCount,
            'pendingLeaves' => $pendingLeaves,
            'recentAttendance' => array_map(
                fn ($a) => AttendanceDTO::fromEntity($a, includeEmployee: true, tz: $tz)->toArray(),
                array_slice($recentAttendance, 0, 10),
            ),
        ];
    }
}

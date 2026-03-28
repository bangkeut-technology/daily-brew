<?php

declare(strict_types=1);

namespace App\Service;

use App\DTO\AttendanceDTO;
use App\Entity\Workspace;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;

final readonly class DashboardService
{
    public function __construct(
        private EmployeeRepository     $employeeRepository,
        private AttendanceRepository   $attendanceRepository,
        private LeaveRequestRepository $leaveRequestRepository,
    ) {}

    public function getTodayStats(Workspace $workspace): array
    {
        $today = new \DateTimeImmutable('today');
        $totalActive = $this->employeeRepository->countActiveByWorkspace($workspace);
        $presentCount = $this->attendanceRepository->countByWorkspaceAndDate($workspace, $today);
        $lateCount = $this->attendanceRepository->countLateByWorkspaceAndDate($workspace, $today);
        $onLeaveCount = $this->leaveRequestRepository->countApprovedByWorkspaceAndDate($workspace, $today);
        $absentCount = max(0, $totalActive - $presentCount - $onLeaveCount);

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
                fn ($a) => AttendanceDTO::fromEntity($a, includeEmployee: true)->toArray(),
                array_slice($recentAttendance, 0, 10),
            ),
        ];
    }
}

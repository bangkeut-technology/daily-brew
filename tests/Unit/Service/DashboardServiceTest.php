<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\DashboardService;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;

class DashboardServiceTest extends TestCase
{
    private EmployeeRepository&Stub $employeeRepo;
    private AttendanceRepository&Stub $attendanceRepo;
    private LeaveRequestRepository&Stub $leaveRepo;
    private DashboardService $svc;

    protected function setUp(): void
    {
        $this->employeeRepo = $this->createStub(EmployeeRepository::class);
        $this->attendanceRepo = $this->createStub(AttendanceRepository::class);
        $this->leaveRepo = $this->createStub(LeaveRequestRepository::class);
        $this->svc = new DashboardService(
            $this->employeeRepo,
            $this->attendanceRepo,
            $this->leaveRepo,
        );
    }

    public function testGetTodayStatsAggregatesCountsAndDerivesAbsent(): void
    {
        $workspace = $this->workspaceWithTimezone('Asia/Phnom_Penh');
        $this->employeeRepo->method('countActiveByWorkspace')->willReturn(10);
        $this->attendanceRepo->method('countByWorkspaceAndDate')->willReturn(7);
        $this->attendanceRepo->method('countLateByWorkspaceAndDate')->willReturn(2);
        $this->leaveRepo->method('countApprovedByWorkspaceAndDate')->willReturn(2);
        $this->attendanceRepo->method('findByWorkspaceAndDate')->willReturn([]);
        $this->leaveRepo->method('countPendingByWorkspace')->willReturn(3);

        $stats = $this->svc->getTodayStats($workspace);

        $this->assertSame(10, $stats['totalEmployees']);
        $this->assertSame(7, $stats['present']);
        $this->assertSame(2, $stats['late']);
        $this->assertSame(2, $stats['onLeave']);
        $this->assertSame(1, $stats['absent']); // 10 - 7 - 2
        $this->assertSame(3, $stats['pendingLeaves']);
        $this->assertSame([], $stats['recentAttendance']);
    }

    public function testAbsentCountClampedToZeroWhenPresentPlusOnLeaveExceedsTotalActive(): void
    {
        // Edge case: more present + on-leave than counted active employees (e.g. due to
        // race between hire/check-in). Absent must never go negative.
        $workspace = $this->workspaceWithTimezone('UTC');
        $this->employeeRepo->method('countActiveByWorkspace')->willReturn(5);
        $this->attendanceRepo->method('countByWorkspaceAndDate')->willReturn(4);
        $this->attendanceRepo->method('countLateByWorkspaceAndDate')->willReturn(1);
        $this->leaveRepo->method('countApprovedByWorkspaceAndDate')->willReturn(3);
        $this->attendanceRepo->method('findByWorkspaceAndDate')->willReturn([]);
        $this->leaveRepo->method('countPendingByWorkspace')->willReturn(0);

        $stats = $this->svc->getTodayStats($workspace);

        $this->assertSame(0, $stats['absent']);
    }

    public function testGetTodayStatsFallsBackToUtcWhenWorkspaceHasNoSetting(): void
    {
        $workspace = new Workspace();
        $this->employeeRepo->method('countActiveByWorkspace')->willReturn(0);
        $this->attendanceRepo->method('countByWorkspaceAndDate')->willReturn(0);
        $this->attendanceRepo->method('countLateByWorkspaceAndDate')->willReturn(0);
        $this->leaveRepo->method('countApprovedByWorkspaceAndDate')->willReturn(0);
        $this->attendanceRepo->method('findByWorkspaceAndDate')->willReturn([]);
        $this->leaveRepo->method('countPendingByWorkspace')->willReturn(0);

        // Should not throw — DateService::today resolves the UTC default.
        $stats = $this->svc->getTodayStats($workspace);

        $this->assertSame(0, $stats['totalEmployees']);
    }

    private function workspaceWithTimezone(string $tz): Workspace
    {
        $workspace = new Workspace();
        $setting = (new WorkspaceSetting())->setTimezone($tz);
        $workspace->setSetting($setting);
        return $workspace;
    }
}

<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\DashboardService;
use App\Service\DateService;
use App\Service\PlanService;
use DateTimeImmutable;
use DateTimeZone;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

class DashboardServiceTest extends TestCase
{
    private EmployeeRepository&Stub $employeeRepo;
    private AttendanceRepository&Stub $attendanceRepo;
    private LeaveRequestRepository&Stub $leaveRepo;
    private PlanService&Stub $planService;
    private DashboardService $svc;

    protected function setUp(): void
    {
        $this->employeeRepo = $this->createStub(EmployeeRepository::class);
        $this->attendanceRepo = $this->createStub(AttendanceRepository::class);
        $this->leaveRepo = $this->createStub(LeaveRequestRepository::class);
        $this->planService = $this->createStub(PlanService::class);
        // Default: per-day rules off (Free tier) — preserves legacy stats math.
        $this->planService->method('canUseShiftTimeRules')->willReturn(false);
        $this->svc = new DashboardService(
            $this->employeeRepo,
            $this->attendanceRepo,
            $this->leaveRepo,
            $this->planService,
        );
    }

    public function testGetTodayStatsAggregatesCountsAndDerivesAbsent(): void
    {
        $workspace = $this->workspaceWithTimezone('Asia/Phnom_Penh');
        // totalEmployees (seat count) includes None-tracked; absent baseline does not.
        $this->employeeRepo->method('countActiveByWorkspace')->willReturn(10);
        $this->employeeRepo->method('countAttendanceTrackedByWorkspace')->willReturn(10);
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
        $this->employeeRepo->method('countAttendanceTrackedByWorkspace')->willReturn(5);
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
        $this->employeeRepo->method('countAttendanceTrackedByWorkspace')->willReturn(0);
        $this->attendanceRepo->method('countByWorkspaceAndDate')->willReturn(0);
        $this->attendanceRepo->method('countLateByWorkspaceAndDate')->willReturn(0);
        $this->leaveRepo->method('countApprovedByWorkspaceAndDate')->willReturn(0);
        $this->attendanceRepo->method('findByWorkspaceAndDate')->willReturn([]);
        $this->leaveRepo->method('countPendingByWorkspace')->willReturn(0);

        // Should not throw — DateService::today resolves the UTC default.
        $stats = $this->svc->getTodayStats($workspace);

        $this->assertSame(0, $stats['totalEmployees']);
    }

    public function testNoneTrackedEmployeesAreExcludedFromAbsentCount(): void
    {
        // 10 active seats, 7 are tracked; 5 present, 1 on leave → absent should be
        // 7 (tracked baseline) - 5 - 1 = 1, NOT 10 - 5 - 1 = 4. None-tracked
        // employees (admin helpers etc.) must never be counted as absent.
        $workspace = $this->workspaceWithTimezone('UTC');
        $this->employeeRepo->method('countActiveByWorkspace')->willReturn(10);
        $this->employeeRepo->method('countAttendanceTrackedByWorkspace')->willReturn(7);
        $this->attendanceRepo->method('countByWorkspaceAndDate')->willReturn(5);
        $this->attendanceRepo->method('countLateByWorkspaceAndDate')->willReturn(0);
        $this->leaveRepo->method('countApprovedByWorkspaceAndDate')->willReturn(1);
        $this->attendanceRepo->method('findByWorkspaceAndDate')->willReturn([]);
        $this->leaveRepo->method('countPendingByWorkspace')->willReturn(0);

        $stats = $this->svc->getTodayStats($workspace);

        $this->assertSame(10, $stats['totalEmployees'], 'Seat-limit count still includes None-tracked');
        $this->assertSame(1, $stats['absent'], '7 tracked - 5 present - 1 on leave = 1');
    }

    public function testOffDayEmployeesDropOutOfAbsentBaselineOnEspresso(): void
    {
        // Saturday on Espresso. 5 tracked employees in total, but 1 GM has a Mon-Fri
        // shift → only 4 are "scheduled today". 3 present, 0 leave → absent = 1, not 2.
        // Without this fix, the GM would show as absent every weekend.
        DateService::setClock(new MockClock(new DateTimeImmutable('2026-04-11 12:00:00', new DateTimeZone('UTC'))));

        $workspace = $this->workspaceWithTimezone('UTC');
        $espresso = $this->createStub(PlanService::class);
        $espresso->method('canUseShiftTimeRules')->willReturn(true);
        $svc = new DashboardService($this->employeeRepo, $this->attendanceRepo, $this->leaveRepo, $espresso);

        $this->employeeRepo->method('countActiveByWorkspace')->willReturn(5);
        // Legacy baseline returns 5 — DashboardService must NOT use it on Espresso.
        $this->employeeRepo->method('countAttendanceTrackedByWorkspace')->willReturn(5);
        $this->employeeRepo->method('countAttendanceTrackedAndScheduledOn')->willReturn(4);
        $this->attendanceRepo->method('countByWorkspaceAndDate')->willReturn(3);
        $this->attendanceRepo->method('countLateByWorkspaceAndDate')->willReturn(0);
        $this->leaveRepo->method('countApprovedByWorkspaceAndDate')->willReturn(0);
        $this->attendanceRepo->method('findByWorkspaceAndDate')->willReturn([]);
        $this->leaveRepo->method('countPendingByWorkspace')->willReturn(0);

        $stats = $svc->getTodayStats($workspace);

        DateService::setClock(null);
        $this->assertSame(1, $stats['absent'], '4 scheduled - 3 present - 0 leave = 1, off-day GM excluded');
    }

    private function workspaceWithTimezone(string $tz): Workspace
    {
        $workspace = new Workspace();
        $setting = (new WorkspaceSetting())->setTimezone($tz);
        $workspace->setSetting($setting);
        return $workspace;
    }
}

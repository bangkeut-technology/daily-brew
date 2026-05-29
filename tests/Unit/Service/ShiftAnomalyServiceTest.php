<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Attendance;
use App\Entity\ClosurePeriod;
use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\Shift;
use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Enum\EmployeeAttendanceTrackingEnum;
use App\Enum\EmployeeStatusEnum;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\DateService;
use App\Service\PlanService;
use App\Service\ShiftAnomalyService;
use DateTimeImmutable;
use DateTimeZone;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

/**
 * Covers the missing check-in / check-out detection logic — the slide-window
 * dedup, the closure / full-day-leave / no-shift / not-tracked skips, and the
 * basic "fires once when expected" cases. All scenarios use UTC as the
 * workspace timezone so the assertions read cleanly against the pinned clock.
 */
#[AllowMockObjectsWithoutExpectations]
class ShiftAnomalyServiceTest extends TestCase
{
    private AttendanceRepository&Stub    $attendanceRepo;
    private ClosurePeriodRepository&Stub $closureRepo;
    private LeaveRequestRepository&Stub  $leaveRepo;
    private PlanService&Stub             $planService;
    private ShiftAnomalyService          $svc;

    protected function setUp(): void
    {
        $this->attendanceRepo = $this->createStub(AttendanceRepository::class);
        $this->closureRepo = $this->createStub(ClosurePeriodRepository::class);
        $this->leaveRepo = $this->createStub(LeaveRequestRepository::class);
        $this->planService = $this->createStub(PlanService::class);

        $this->closureRepo->method('findActiveOnDate')->willReturn(null);
        $this->leaveRepo->method('findApprovedForEmployeeOnDate')->willReturn(null);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn(null);
        // canUseShiftTimeRules defaults to false — every test uses the shift's own start/end.

        $this->svc = new ShiftAnomalyService(
            $this->attendanceRepo,
            $this->closureRepo,
            $this->leaveRepo,
            $this->planService,
        );
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
        parent::tearDown();
    }

    // ── Missing check-in ─────────────────────────────────────────────────

    public function testReportsMissingCheckinWhenOneHourPastShiftStartAndNoAttendance(): void
    {
        // Shift 09:00 → due-at = 10:00. Scan at 10:00 ⇒ inside window (now == dueAt).
        $this->pinClockTo('2026-04-10 10:00:00');
        $employee = $this->trackedEmployeeWithShift('09:00:00', '17:00:00');
        $workspace = $this->workspaceWith([$employee]);

        $anomalies = $this->svc->scan($workspace, DateService::now());

        $this->assertCount(1, $anomalies);
        $this->assertSame('missing_checkin', $anomalies[0]['type']);
        $this->assertSame($employee, $anomalies[0]['employee']);
        $this->assertSame('2026-04-10 10:00:00', $anomalies[0]['expectedAt']->format('Y-m-d H:i:s'));
    }

    public function testDoesNotReportMissingCheckinJustBeforeOneHourMark(): void
    {
        // dueAt = 10:00, now = 09:59:30, windowStart = 09:54:30 → dueAt is in the future.
        $this->pinClockTo('2026-04-10 09:59:30');
        $employee = $this->trackedEmployeeWithShift('09:00:00', '17:00:00');
        $workspace = $this->workspaceWith([$employee]);

        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    public function testDoesNotReportMissingCheckinOneScanAfterTheWindowHasPassed(): void
    {
        // dueAt = 10:00, but the next scan runs at 10:05:01 → windowStart = 10:00:01 → dueAt outside.
        // Prevents firing the same alert twice on consecutive 5-min scans.
        $this->pinClockTo('2026-04-10 10:05:01');
        $employee = $this->trackedEmployeeWithShift('09:00:00', '17:00:00');
        $workspace = $this->workspaceWith([$employee]);

        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    // ── Missing check-out ────────────────────────────────────────────────

    public function testReportsMissingCheckoutWhenOneHourPastShiftEndAndAttendanceStillOpen(): void
    {
        // Shift end 17:00 → due-at = 18:00. Scan at 18:00 ⇒ inside window.
        $this->pinClockTo('2026-04-10 18:00:00');
        $employee = $this->trackedEmployeeWithShift('09:00:00', '17:00:00');
        $attendance = (new Attendance())
            ->setEmployee($employee)
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 09:02:00', new DateTimeZone('UTC')));

        $this->attendanceRepo = $this->createStub(AttendanceRepository::class);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($attendance);
        $this->rebuildService();

        $workspace = $this->workspaceWith([$employee]);

        $anomalies = $this->svc->scan($workspace, DateService::now());

        $this->assertCount(1, $anomalies);
        $this->assertSame('missing_checkout', $anomalies[0]['type']);
        $this->assertSame($attendance, $anomalies[0]['attendance']);
        $this->assertSame('2026-04-10 18:00:00', $anomalies[0]['expectedAt']->format('Y-m-d H:i:s'));
    }

    public function testDoesNotReportMissingCheckoutWhenCheckOutAlreadyRecorded(): void
    {
        $this->pinClockTo('2026-04-10 18:00:00');
        $employee = $this->trackedEmployeeWithShift('09:00:00', '17:00:00');
        $attendance = (new Attendance())
            ->setEmployee($employee)
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 09:02:00', new DateTimeZone('UTC')))
            ->setCheckOutAt(new DateTimeImmutable('2026-04-10 17:00:00', new DateTimeZone('UTC')));

        $this->attendanceRepo = $this->createStub(AttendanceRepository::class);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($attendance);
        $this->rebuildService();

        $workspace = $this->workspaceWith([$employee]);
        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    // ── Skips ────────────────────────────────────────────────────────────

    public function testApprovedFullDayLeaveSilencesBothAlerts(): void
    {
        $this->pinClockTo('2026-04-10 10:00:00');
        $employee = $this->trackedEmployeeWithShift('09:00:00', '17:00:00');

        $fullDayLeave = (new LeaveRequest())
            ->setStartDate(new DateTimeImmutable('2026-04-10'))
            ->setEndDate(new DateTimeImmutable('2026-04-10'));
        // startTime/endTime both null → isFullDay() == true

        $this->leaveRepo = $this->createStub(LeaveRequestRepository::class);
        $this->leaveRepo->method('findApprovedForEmployeeOnDate')->willReturn($fullDayLeave);
        $this->rebuildService();

        $workspace = $this->workspaceWith([$employee]);
        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    public function testClosureOnTheDayReturnsEmptyImmediately(): void
    {
        $this->pinClockTo('2026-04-10 10:00:00');
        $employee = $this->trackedEmployeeWithShift('09:00:00', '17:00:00');

        $closure = (new ClosurePeriod())
            ->setName('Public holiday')
            ->setStartDate(new DateTimeImmutable('2026-04-10'))
            ->setEndDate(new DateTimeImmutable('2026-04-10'));

        $this->closureRepo = $this->createStub(ClosurePeriodRepository::class);
        $this->closureRepo->method('findActiveOnDate')->willReturn($closure);
        $this->rebuildService();

        $workspace = $this->workspaceWith([$employee]);
        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    public function testAttendanceTrackingNoneEmployeesAreExcluded(): void
    {
        $this->pinClockTo('2026-04-10 10:00:00');
        $employee = $this->trackedEmployeeWithShift('09:00:00', '17:00:00');
        $employee->setAttendanceTracking(EmployeeAttendanceTrackingEnum::None);

        $workspace = $this->workspaceWith([$employee]);
        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    public function testEmployeesWithoutAShiftAreExcluded(): void
    {
        $this->pinClockTo('2026-04-10 10:00:00');
        $employee = (new Employee())
            ->setFirstName('Lyhour')
            ->setLastName('Huy');
        // No shift attached and attendanceTracking defaults to Full.

        $workspace = $this->workspaceWith([$employee]);
        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    public function testInactiveOrDeletedEmployeesAreExcluded(): void
    {
        $this->pinClockTo('2026-04-10 10:00:00');

        $inactive = $this->trackedEmployeeWithShift('09:00:00', '17:00:00');
        $inactive->setStatus(EmployeeStatusEnum::INACTIVE);

        $deleted = $this->trackedEmployeeWithShift('09:00:00', '17:00:00');
        $deleted->setDeletedAt(new DateTimeImmutable('2026-04-09', new DateTimeZone('UTC')));

        $workspace = $this->workspaceWith([$inactive, $deleted]);
        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    // ── Timezone ─────────────────────────────────────────────────────────

    public function testUsesWorkspaceLocalTimeForShiftMath(): void
    {
        // Shift 09:00 Asia/Phnom_Penh (UTC+7) → due-at = 10:00 local = 03:00 UTC.
        // Pin UTC clock to 03:00 ⇒ should fire.
        $this->pinClockTo('2026-04-10 03:00:00');
        $employee = $this->trackedEmployeeWithShift('09:00:00', '17:00:00');
        $workspace = $this->workspaceWith([$employee], timezone: 'Asia/Phnom_Penh');

        $anomalies = $this->svc->scan($workspace, DateService::now());

        $this->assertCount(1, $anomalies);
        $this->assertSame('missing_checkin', $anomalies[0]['type']);
        $this->assertSame('03:00:00', $anomalies[0]['expectedAt']->setTimezone(new DateTimeZone('UTC'))->format('H:i:s'));
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private function pinClockTo(string $iso): void
    {
        DateService::setClock(new MockClock($iso, new DateTimeZone('UTC')));
    }

    private function trackedEmployeeWithShift(string $start, string $end): Employee
    {
        $shift = (new Shift())
            ->setName('Morning')
            ->setStartTime(new DateTimeImmutable($start))
            ->setEndTime(new DateTimeImmutable($end));
        $emp = (new Employee())
            ->setFirstName('Lyhour')
            ->setLastName('Huy')
            ->setShift($shift);
        $emp->setStatus(EmployeeStatusEnum::ACTIVE);
        return $emp;
    }

    /**
     * @param Employee[] $employees
     */
    private function workspaceWith(array $employees, string $timezone = 'UTC'): Workspace
    {
        $ws = new Workspace();
        $ws->setName('Test Workspace');
        $setting = (new WorkspaceSetting())->setTimezone($timezone);
        $ws->setSetting($setting);

        foreach ($employees as $employee) {
            $employee->setWorkspace($ws);
            if ($employee->getShift() !== null && $employee->getShift()->getWorkspace() === null) {
                $employee->getShift()->setWorkspace($ws);
            }
            $ws->getEmployees()->add($employee);
        }
        return $ws;
    }

    private function rebuildService(): void
    {
        $this->svc = new ShiftAnomalyService(
            $this->attendanceRepo,
            $this->closureRepo,
            $this->leaveRepo,
            $this->planService,
        );
    }
}

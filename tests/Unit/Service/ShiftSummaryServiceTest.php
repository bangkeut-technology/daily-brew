<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Attendance;
use App\Entity\ClosurePeriod;
use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Enum\DayOfWeekEnum;
use App\Enum\EmployeeAttendanceTrackingEnum;
use App\Enum\EmployeeStatusEnum;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\DateService;
use App\Service\PlanService;
use App\Service\ShiftSummaryService;
use DateTimeImmutable;
use DateTimeZone;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

/**
 * Covers the per-shift digest logic — bucket math (on-time / late / missed for
 * start, completed / left-early / missed for end), scan-window dedupe, closure
 * and full-day-leave silencers, the `attendanceTracking=none` exclusion, and
 * the per-shift-time-rule override path. All scenarios use UTC as the
 * workspace timezone so the assertions read cleanly against the pinned clock.
 */
#[AllowMockObjectsWithoutExpectations]
class ShiftSummaryServiceTest extends TestCase
{
    private AttendanceRepository&Stub    $attendanceRepo;
    private ClosurePeriodRepository&Stub $closureRepo;
    private LeaveRequestRepository&Stub  $leaveRepo;
    private PlanService&Stub             $planService;
    private ShiftSummaryService          $svc;

    /** @var array<string, Attendance> employeePublicId-ish key => attendance for the day */
    private array $attendanceByEmployee = [];

    protected function setUp(): void
    {
        $this->attendanceRepo = $this->createStub(AttendanceRepository::class);
        $this->closureRepo = $this->createStub(ClosurePeriodRepository::class);
        $this->leaveRepo = $this->createStub(LeaveRequestRepository::class);
        $this->planService = $this->createStub(PlanService::class);

        $this->closureRepo->method('findActiveOnDate')->willReturn(null);
        $this->leaveRepo->method('findApprovedForEmployeeOnDate')->willReturn(null);
        $this->attendanceRepo->method('findByEmployeeAndDate')
            ->willReturnCallback(fn (Employee $emp) => $this->attendanceByEmployee[spl_object_hash($emp)] ?? null);
        // canUseShiftTimeRules defaults to false — most tests use the shift's own start/end.

        $this->svc = $this->buildService();
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
        $this->attendanceByEmployee = [];
        parent::tearDown();
    }

    // ── Start summary ────────────────────────────────────────────────────

    public function testFiresStartSummaryWhenShiftStartPlusThirtyMinJustLanded(): void
    {
        // Shift start 09:00 → dueAt = 09:30. Scan at 09:30 ⇒ inside window (now == dueAt).
        $this->pinClockTo('2026-04-10 09:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $employee = $this->trackedEmployeeOnShift($shift);
        $workspace = $this->workspaceWith([$shift], [$employee]);

        $summaries = $this->svc->scan($workspace, DateService::now());

        $this->assertCount(1, $summaries);
        $this->assertSame('start', $summaries[0]['type']);
        $this->assertSame($shift, $summaries[0]['shift']);
        $this->assertSame(1, $summaries[0]['total']);
        $this->assertSame('2026-04-10 09:30:00', $summaries[0]['dueAt']->format('Y-m-d H:i:s'));
    }

    public function testStartSummaryBucketsAllOnTimeEmployees(): void
    {
        $this->pinClockTo('2026-04-10 09:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $emp1 = $this->trackedEmployeeOnShift($shift, 'Lyhour', 'Huy');
        $emp2 = $this->trackedEmployeeOnShift($shift, 'Sokha', 'Chea');
        $this->giveAttendance($emp1, checkInAt: '2026-04-10 09:00:00');
        $this->giveAttendance($emp2, checkInAt: '2026-04-10 08:58:00');

        $workspace = $this->workspaceWith([$shift], [$emp1, $emp2]);
        $summaries = $this->svc->scan($workspace, DateService::now());

        $this->assertCount(1, $summaries);
        $start = $summaries[0];
        $this->assertSame(2, $start['total']);
        $this->assertCount(2, $start['onTime']);
        $this->assertSame([], $start['late']);
        $this->assertSame([], $start['missed']);
    }

    public function testStartSummaryFlagsLateEmployee(): void
    {
        $this->pinClockTo('2026-04-10 09:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $emp = $this->trackedEmployeeOnShift($shift, 'Lyhour', 'Huy');
        $this->giveAttendance($emp, checkInAt: '2026-04-10 09:20:00', isLate: true);

        $workspace = $this->workspaceWith([$shift], [$emp]);
        $summaries = $this->svc->scan($workspace, DateService::now());

        $start = $summaries[0];
        $this->assertCount(1, $start['late']);
        $this->assertSame($emp, $start['late'][0]);
        $this->assertSame([], $start['onTime']);
        $this->assertSame([], $start['missed']);
    }

    public function testStartSummaryFlagsMissedEmployeeWithNoAttendance(): void
    {
        $this->pinClockTo('2026-04-10 09:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $emp = $this->trackedEmployeeOnShift($shift, 'Lyhour', 'Huy');
        // No attendance — will hit missed bucket.

        $workspace = $this->workspaceWith([$shift], [$emp]);
        $summaries = $this->svc->scan($workspace, DateService::now());

        $start = $summaries[0];
        $this->assertSame(1, $start['total']);
        $this->assertCount(1, $start['missed']);
        $this->assertSame($emp, $start['missed'][0]);
    }

    // ── End summary ──────────────────────────────────────────────────────

    public function testFiresEndSummaryWhenShiftEndPlusThirtyMinJustLanded(): void
    {
        // Shift end 17:00 → dueAt = 17:30. Scan at 17:30 ⇒ inside window.
        $this->pinClockTo('2026-04-10 17:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $emp = $this->trackedEmployeeOnShift($shift, 'Lyhour', 'Huy');
        $this->giveAttendance(
            $emp,
            checkInAt: '2026-04-10 09:00:00',
            checkOutAt: '2026-04-10 17:01:00',
        );
        $workspace = $this->workspaceWith([$shift], [$emp]);

        $summaries = $this->svc->scan($workspace, DateService::now());

        $this->assertCount(1, $summaries);
        $this->assertSame('end', $summaries[0]['type']);
        $this->assertSame(1, $summaries[0]['total']);
        $this->assertCount(1, $summaries[0]['completed']);
        $this->assertSame($emp, $summaries[0]['completed'][0]);
        $this->assertSame([], $summaries[0]['leftEarly']);
        $this->assertSame([], $summaries[0]['missed']);
    }

    public function testEndSummaryFlagsLeftEarlyEmployee(): void
    {
        $this->pinClockTo('2026-04-10 17:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $emp = $this->trackedEmployeeOnShift($shift, 'Lyhour', 'Huy');
        $this->giveAttendance(
            $emp,
            checkInAt: '2026-04-10 09:00:00',
            checkOutAt: '2026-04-10 16:30:00',
            leftEarly: true,
        );
        $workspace = $this->workspaceWith([$shift], [$emp]);

        $summaries = $this->svc->scan($workspace, DateService::now());

        $end = $summaries[0];
        $this->assertCount(1, $end['leftEarly']);
        $this->assertSame($emp, $end['leftEarly'][0]);
        $this->assertSame([], $end['completed']);
        $this->assertSame([], $end['missed']);
    }

    public function testEndSummaryFlagsMissedEmployeeWithNoCheckin(): void
    {
        $this->pinClockTo('2026-04-10 17:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $emp = $this->trackedEmployeeOnShift($shift, 'Lyhour', 'Huy');
        // No attendance row at all → missed for the end summary too.

        $workspace = $this->workspaceWith([$shift], [$emp]);
        $summaries = $this->svc->scan($workspace, DateService::now());

        $end = $summaries[0];
        $this->assertCount(1, $end['missed']);
        $this->assertSame($emp, $end['missed'][0]);
    }

    // ── Both summaries can land in the same tick ─────────────────────────

    public function testBothStartAndEndCanFireInTheSameScanTick(): void
    {
        // Morning shift ends 12:00 → end+30 = 12:30.
        // Evening shift starts 12:00 → start+30 = 12:30.
        // One scan at 12:30 ⇒ both digests fire.
        $this->pinClockTo('2026-04-10 12:30:00');

        $morning = $this->shift('Morning', '06:00:00', '12:00:00');
        $evening = $this->shift('Evening', '12:00:00', '20:00:00');

        $morningEmp = $this->trackedEmployeeOnShift($morning, 'Lyhour', 'Huy');
        $this->giveAttendance(
            $morningEmp,
            checkInAt: '2026-04-10 06:00:00',
            checkOutAt: '2026-04-10 12:00:00',
        );
        $eveningEmp = $this->trackedEmployeeOnShift($evening, 'Sokha', 'Chea');
        $this->giveAttendance($eveningEmp, checkInAt: '2026-04-10 11:55:00');

        $workspace = $this->workspaceWith([$morning, $evening], [$morningEmp, $eveningEmp]);
        $summaries = $this->svc->scan($workspace, DateService::now());

        $this->assertCount(2, $summaries);
        $types = array_map(fn ($s) => $s['type'], $summaries);
        $this->assertContains('start', $types);
        $this->assertContains('end', $types);
    }

    // ── Scan window edges ────────────────────────────────────────────────

    public function testNoFireJustBeforeThirtyMinMark(): void
    {
        // dueAt = 09:30, now = 09:29:30, windowStart = 09:24:30 → dueAt is in the future.
        $this->pinClockTo('2026-04-10 09:29:30');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $emp = $this->trackedEmployeeOnShift($shift);
        $workspace = $this->workspaceWith([$shift], [$emp]);

        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    public function testNoFireOneScanAfterWindowPassed(): void
    {
        // dueAt = 09:30, next scan at 09:35:01 → windowStart = 09:30:01 → dueAt outside.
        // Prevents firing the same digest twice on consecutive 5-min scans.
        $this->pinClockTo('2026-04-10 09:35:01');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $emp = $this->trackedEmployeeOnShift($shift);
        $workspace = $this->workspaceWith([$shift], [$emp]);

        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    // ── Silencers ────────────────────────────────────────────────────────

    public function testEmployeeOnApprovedFullDayLeaveIsExcludedFromTotalAndBuckets(): void
    {
        $this->pinClockTo('2026-04-10 09:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $emp = $this->trackedEmployeeOnShift($shift, 'Lyhour', 'Huy');

        $fullDayLeave = (new LeaveRequest())
            ->setStartDate(new DateTimeImmutable('2026-04-10'))
            ->setEndDate(new DateTimeImmutable('2026-04-10'));
        // startTime/endTime both null → isFullDay() == true

        $this->leaveRepo = $this->createStub(LeaveRequestRepository::class);
        $this->leaveRepo->method('findApprovedForEmployeeOnDate')->willReturn($fullDayLeave);
        $this->svc = $this->buildService();

        $workspace = $this->workspaceWith([$shift], [$emp]);
        // Only employee is on leave → shift roster empty → no summary.
        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    public function testClosureOnTheDayReturnsEmptyImmediately(): void
    {
        $this->pinClockTo('2026-04-10 09:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $emp = $this->trackedEmployeeOnShift($shift);

        $closure = (new ClosurePeriod())
            ->setName('Public holiday')
            ->setStartDate(new DateTimeImmutable('2026-04-10'))
            ->setEndDate(new DateTimeImmutable('2026-04-10'));

        $this->closureRepo = $this->createStub(ClosurePeriodRepository::class);
        $this->closureRepo->method('findActiveOnDate')->willReturn($closure);
        $this->svc = $this->buildService();

        $workspace = $this->workspaceWith([$shift], [$emp]);
        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    public function testShiftWithNoEmployeesYieldsNoSummary(): void
    {
        $this->pinClockTo('2026-04-10 09:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $workspace = $this->workspaceWith([$shift], []);

        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    public function testAttendanceTrackingNoneEmployeesAreExcluded(): void
    {
        $this->pinClockTo('2026-04-10 09:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');
        $emp = $this->trackedEmployeeOnShift($shift);
        $emp->setAttendanceTracking(EmployeeAttendanceTrackingEnum::None);

        $workspace = $this->workspaceWith([$shift], [$emp]);
        // Roster filtered to nothing → no summary.
        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    public function testInactiveOrDeletedEmployeesAreExcluded(): void
    {
        $this->pinClockTo('2026-04-10 09:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');

        $inactive = $this->trackedEmployeeOnShift($shift, 'In', 'Active');
        $inactive->setStatus(EmployeeStatusEnum::INACTIVE);

        $deleted = $this->trackedEmployeeOnShift($shift, 'Soft', 'Deleted');
        $deleted->setDeletedAt(new DateTimeImmutable('2026-04-09', new DateTimeZone('UTC')));

        $workspace = $this->workspaceWith([$shift], [$inactive, $deleted]);
        $this->assertSame([], $this->svc->scan($workspace, DateService::now()));
    }

    // ── Per-shift-time-rule override ─────────────────────────────────────

    public function testPerShiftTimeRuleOverridesShiftStartEnd(): void
    {
        // 2026-04-10 is a Friday. Rule overrides Friday start to 11:00 → dueAt = 11:30.
        // Default shift start (09:00) would have given dueAt = 09:30. Pin clock to 11:30.
        $this->pinClockTo('2026-04-10 11:30:00');
        $shift = $this->shift('Morning', '09:00:00', '17:00:00');

        $rule = (new ShiftTimeRule())
            ->setShift($shift)
            ->setDayOfWeek(DayOfWeekEnum::Friday)
            ->setStartTime('11:00')
            ->setEndTime('19:00');
        $shift->addTimeRule($rule);

        $this->planService = $this->createStub(PlanService::class);
        $this->planService->method('canUseShiftTimeRules')->willReturn(true);
        $this->svc = $this->buildService();

        $emp = $this->trackedEmployeeOnShift($shift);
        $workspace = $this->workspaceWith([$shift], [$emp]);

        $summaries = $this->svc->scan($workspace, DateService::now());
        $this->assertCount(1, $summaries);
        $this->assertSame('start', $summaries[0]['type']);
        $this->assertSame('2026-04-10 11:30:00', $summaries[0]['dueAt']->format('Y-m-d H:i:s'));
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private function pinClockTo(string $iso): void
    {
        DateService::setClock(new MockClock($iso, new DateTimeZone('UTC')));
    }

    private function shift(string $name, string $start, string $end): Shift
    {
        return (new Shift())
            ->setName($name)
            ->setStartTime(new DateTimeImmutable($start))
            ->setEndTime(new DateTimeImmutable($end));
    }

    private function trackedEmployeeOnShift(Shift $shift, string $first = 'Lyhour', string $last = 'Huy'): Employee
    {
        $emp = (new Employee())
            ->setFirstName($first)
            ->setLastName($last)
            ->setShift($shift);
        $emp->setStatus(EmployeeStatusEnum::ACTIVE);

        $employees = $shift->getEmployees();
        if (!$employees->contains($emp)) {
            $employees->add($emp);
        }
        return $emp;
    }

    private function giveAttendance(
        Employee $employee,
        string $checkInAt,
        ?string $checkOutAt = null,
        bool $isLate = false,
        bool $leftEarly = false,
    ): Attendance {
        $att = (new Attendance())
            ->setEmployee($employee)
            ->setCheckInAt(new DateTimeImmutable($checkInAt, new DateTimeZone('UTC')))
            ->setIsLate($isLate)
            ->setLeftEarly($leftEarly);
        if ($checkOutAt !== null) {
            $att->setCheckOutAt(new DateTimeImmutable($checkOutAt, new DateTimeZone('UTC')));
        }
        $this->attendanceByEmployee[spl_object_hash($employee)] = $att;
        return $att;
    }

    /**
     * @param Shift[]    $shifts
     * @param Employee[] $employees
     */
    private function workspaceWith(array $shifts, array $employees, string $timezone = 'UTC'): Workspace
    {
        $ws = new Workspace();
        $ws->setName('Test Workspace');
        $setting = (new WorkspaceSetting())->setTimezone($timezone);
        $ws->setSetting($setting);

        foreach ($shifts as $shift) {
            $shift->setWorkspace($ws);
            $ws->getShifts()->add($shift);
        }
        foreach ($employees as $employee) {
            $employee->setWorkspace($ws);
            $ws->getEmployees()->add($employee);
        }
        return $ws;
    }

    private function buildService(): ShiftSummaryService
    {
        return new ShiftSummaryService(
            $this->attendanceRepo,
            $this->closureRepo,
            $this->leaveRepo,
            $this->planService,
        );
    }
}

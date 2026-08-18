<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use App\Entity\Workspace;
use App\Enum\DayOfWeekEnum;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\AttendanceFlagCalculator;
use App\Service\Checkin\EffectiveCheckinSettings;
use App\Service\CheckinService;
use App\Service\DateService;
use App\Service\PlanService;
use App\Service\Shift\ShiftScheduleResolver;
use DateTimeImmutable;
use DateTimeZone;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

/**
 * Shifts that run past midnight (bars, late kitchens): the check-out happens on
 * the calendar day *after* the one the work belongs to.
 *
 * Before this was handled, the 02:00 scan found no row for "today", created a
 * second one, and left the previous evening's row open forever — and the next
 * evening's genuine check-in then read as a check-out for that bogus row, so
 * every following day was wrong too.
 */
#[AllowMockObjectsWithoutExpectations]
class CheckinServiceOvernightTest extends TestCase
{
    private AttendanceRepository&MockObject $attendanceRepo;
    private ClosurePeriodRepository&Stub $closureRepo;
    private LeaveRequestRepository&Stub $leaveRepo;
    private PlanService&Stub $planService;
    private ShiftScheduleResolver $scheduleResolver;
    private CheckinService $svc;

    protected function setUp(): void
    {
        $this->attendanceRepo = $this->createMock(AttendanceRepository::class);
        $this->closureRepo = $this->createStub(ClosurePeriodRepository::class);
        $this->leaveRepo = $this->createStub(LeaveRequestRepository::class);
        $this->planService = $this->createStub(PlanService::class);
        $this->scheduleResolver = new ShiftScheduleResolver($this->planService);

        $this->closureRepo->method('findActiveOnDate')->willReturn(null);
        $this->leaveRepo->method('findApprovedForEmployeeOnDate')->willReturn(null);

        $this->svc = new CheckinService(
            $this->attendanceRepo,
            $this->closureRepo,
            $this->leaveRepo,
            new AttendanceFlagCalculator($this->scheduleResolver),
            $this->scheduleResolver,
        );
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
        parent::tearDown();
    }

    // ── The reported bug ─────────────────────────────────────────────

    public function testPostMidnightScanClosesTheShiftThatStartedYesterday(): void
    {
        // Shift B: 18:00 → 02:00. Checked in Friday evening, scanning at 02:10.
        $this->pinClockTo('2026-04-11 02:10:00');
        $open = $this->openRowFor('2026-04-10', checkInAt: '2026-04-10 18:00:00');
        $this->rowsByDate(['2026-04-10' => $open]);

        // No second row — the punch belongs to Friday.
        $this->attendanceRepo->expects($this->never())->method('persist');

        $result = $this->svc->checkin(
            $this->overnightEmployee(),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertSame($open, $result);
        $this->assertSame('2026-04-10', $result->getDate()->format('Y-m-d'));
        $this->assertSame('2026-04-11 02:10', $result->getCheckOutAt()->format('Y-m-d H:i'));
    }

    public function testCheckOutAtTheShiftEndIsNotFlaggedLeftEarly(): void
    {
        // 02:00 is the shift end — the old minute math read it as 120 and
        // compared it against an end of 120, but only after having read the
        // check-in as 1080. Everything now sits on one axis.
        $this->pinClockTo('2026-04-11 02:00:00');
        $open = $this->openRowFor('2026-04-10', checkInAt: '2026-04-10 18:00:00');
        $this->rowsByDate(['2026-04-10' => $open]);

        $this->svc->checkin($this->overnightEmployee(), clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertFalse($open->hasLeftEarly());
    }

    public function testLeavingBeforeTheOvernightShiftEndIsStillFlaggedLeftEarly(): void
    {
        $this->pinClockTo('2026-04-11 00:30:00');
        $open = $this->openRowFor('2026-04-10', checkInAt: '2026-04-10 18:00:00');
        $this->rowsByDate(['2026-04-10' => $open]);

        $this->svc->checkin($this->overnightEmployee(), clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertTrue($open->hasLeftEarly(), '00:30 is 90 minutes short of a 02:00 end');
    }

    public function testLateArrivalOnAnOvernightShiftIsStillFlagged(): void
    {
        $this->pinClockTo('2026-04-10 18:30:00');
        $this->rowsByDate([]);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $this->svc->checkin($this->overnightEmployee(), clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertTrue($captured->isLate());
        $this->assertSame('2026-04-10', $captured->getDate()->format('Y-m-d'));
    }

    // ── Where the look-back must NOT reach ───────────────────────────

    public function testScanAfterTheGraceWindowStartsANewDayInstead(): void
    {
        // Shift ended 02:00; the window closes at 06:00. A 06:30 scan is
        // somebody starting a new day, not finishing the old one — yesterday's
        // row stays open for a manager to close.
        $this->pinClockTo('2026-04-11 06:30:00');
        $open = $this->openRowFor('2026-04-10', checkInAt: '2026-04-10 18:00:00');
        $this->rowsByDate(['2026-04-10' => $open]);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $this->svc->checkin($this->overnightEmployee(), clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertSame('2026-04-11', $captured->getDate()->format('Y-m-d'));
        $this->assertNull($open->getCheckOutAt(), "Yesterday's row is left untouched");
    }

    public function testSecondNightCheckInIsNotSwallowedByYesterdaysClosedRow(): void
    {
        // Friday's row was closed properly at 02:00. Saturday 18:00 must open a
        // fresh row rather than be read as a check-out.
        $this->pinClockTo('2026-04-11 18:00:00');
        $closed = $this->openRowFor('2026-04-10', checkInAt: '2026-04-10 18:00:00')
            ->setCheckOutAt(new DateTimeImmutable('2026-04-11 02:00:00'));
        $this->rowsByDate(['2026-04-10' => $closed]);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $this->svc->checkin($this->overnightEmployee(), clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertSame('2026-04-11', $captured->getDate()->format('Y-m-d'));
    }

    public function testDayShiftKeepsBucketingPostMidnightScansUnderToday(): void
    {
        // 09:00–17:00 does not cross midnight, so a 00:30 scan is a new day —
        // unchanged from the behavior that shipped before overnight support.
        $this->pinClockTo('2026-04-11 00:30:00');
        $open = $this->openRowFor('2026-04-10', checkInAt: '2026-04-10 09:00:00');
        $this->rowsByDate(['2026-04-10' => $open]);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $this->svc->checkin($this->dayEmployee(), clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertSame('2026-04-11', $captured->getDate()->format('Y-m-d'));
    }

    public function testVoidedRowFromYesterdayIsNotResurrectedByAPostMidnightScan(): void
    {
        // A voided row is a tombstone — there is no open shift to close, so the
        // scan opens today instead of un-voiding yesterday behind the manager.
        $this->pinClockTo('2026-04-11 02:10:00');
        $voided = $this->openRowFor('2026-04-10', checkInAt: '2026-04-10 18:00:00')
            ->setVoidedAt(new DateTimeImmutable('2026-04-10 23:00:00'));
        $this->rowsByDate(['2026-04-10' => $voided]);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $this->svc->checkin($this->overnightEmployee(), clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertSame('2026-04-11', $captured->getDate()->format('Y-m-d'));
    }

    public function testEmployeeWithNoShiftIsUnaffected(): void
    {
        $this->pinClockTo('2026-04-11 02:10:00');
        $open = $this->openRowFor('2026-04-10', checkInAt: '2026-04-10 18:00:00');
        $this->rowsByDate(['2026-04-10' => $open]);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $emp = (new Employee())->setWorkspace(new Workspace());
        $this->svc->checkin($emp, clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertSame('2026-04-11', $captured->getDate()->format('Y-m-d'));
    }

    // ── Per-day rules decide overnight-ness day by day ───────────────

    public function testPerDayRuleMakesFridayOvernightEvenWhenSaturdayIsOff(): void
    {
        // Fri 18:00–02:00, Sat not scheduled. Saturday 02:10 belongs to Friday —
        // resolved against the *shift day*, not the day the scan landed on.
        $this->pinClockTo('2026-04-11 02:10:00');
        $this->planService->method('canUseShiftTimeRules')->willReturn(true);
        $open = $this->openRowFor('2026-04-10', checkInAt: '2026-04-10 18:00:00');
        $this->rowsByDate(['2026-04-10' => $open]);

        $this->attendanceRepo->expects($this->never())->method('persist');

        $result = $this->svc->checkin(
            $this->fridayNightEmployee(),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertSame($open, $result);
        $this->assertNotNull($result->getCheckOutAt());
        $this->assertFalse($result->hasLeftEarly(), '02:10 is past the 02:00 Friday-rule end');
    }

    // ── Status ───────────────────────────────────────────────────────

    public function testStatusReportsTheStillOpenOvernightRowRatherThanNothing(): void
    {
        $this->pinClockTo('2026-04-11 01:00:00');
        $open = $this->openRowFor('2026-04-10', checkInAt: '2026-04-10 18:00:00');
        $this->rowsByDate(['2026-04-10' => $open]);

        $emp = $this->overnightEmployee();
        $emp->getWorkspace()->setSetting($this->workspaceSettingWithTz('UTC'));

        $this->assertSame($open, $this->svc->getStatus($emp));
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private function pinClockTo(string $iso): void
    {
        DateService::setClock(new MockClock($iso, new DateTimeZone('UTC')));
    }

    /** @param array<string, Attendance> $rows keyed by Y-m-d */
    private function rowsByDate(array $rows): void
    {
        $this->attendanceRepo->method('findByEmployeeAndDate')
            ->willReturnCallback(static fn (Employee $e, \DateTimeInterface $d): ?Attendance
                => $rows[$d->format('Y-m-d')] ?? null);
    }

    private function openRowFor(string $date, string $checkInAt): Attendance
    {
        return (new Attendance())
            ->setDate(new DateTimeImmutable($date))
            ->setCheckInAt(new DateTimeImmutable($checkInAt));
    }

    private function overnightEmployee(): Employee
    {
        $workspace = new Workspace();
        $shift = (new Shift())
            ->setWorkspace($workspace)
            ->setStartTime(new DateTimeImmutable('18:00:00'))
            ->setEndTime(new DateTimeImmutable('02:00:00'));

        return (new Employee())->setShift($shift)->setWorkspace($workspace);
    }

    private function dayEmployee(): Employee
    {
        $workspace = new Workspace();
        $shift = (new Shift())
            ->setWorkspace($workspace)
            ->setStartTime(new DateTimeImmutable('09:00:00'))
            ->setEndTime(new DateTimeImmutable('17:00:00'));

        return (new Employee())->setShift($shift)->setWorkspace($workspace);
    }

    /** Friday 18:00–02:00 only; every other day is an off-day. */
    private function fridayNightEmployee(): Employee
    {
        $workspace = new Workspace();
        $shift = (new Shift())
            ->setWorkspace($workspace)
            ->setStartTime(new DateTimeImmutable('09:00:00'))
            ->setEndTime(new DateTimeImmutable('17:00:00'));
        $shift->addTimeRule(
            (new ShiftTimeRule())->setDayOfWeek(DayOfWeekEnum::Friday)->setStartTime('18:00')->setEndTime('02:00')
        );

        return (new Employee())->setShift($shift)->setWorkspace($workspace);
    }

    private function settings(string $timezone = 'UTC'): EffectiveCheckinSettings
    {
        return new EffectiveCheckinSettings(
            timezone: $timezone,
            ipRestrictionEnabled: false,
            allowedIps: null,
            geofencingEnabled: false,
            geofencingLatitude: null,
            geofencingLongitude: null,
            geofencingRadiusMeters: null,
            deviceVerificationEnabled: false,
        );
    }

    private function workspaceSettingWithTz(string $tz): \App\Entity\WorkspaceSetting
    {
        return (new \App\Entity\WorkspaceSetting())->setTimezone($tz);
    }
}

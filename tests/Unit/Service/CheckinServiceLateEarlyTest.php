<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use App\Entity\Workspace;
use App\Enum\DayOfWeekEnum;
use App\Enum\EmployeeAttendanceTrackingEnum;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\AttendanceFlagCalculator;
use App\Service\Checkin\EffectiveCheckinSettings;
use App\Service\CheckinService;
use App\Service\DateService;
use App\Service\PlanService;
use DateTimeImmutable;
use DateTimeZone;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

/**
 * Covers the late-arrival and left-early flags on check-in/out — the parts of
 * CheckinService that depend on the current wall-clock and so couldn't be
 * tested deterministically before DateService gained a clock seam.
 */
#[AllowMockObjectsWithoutExpectations]
class CheckinServiceLateEarlyTest extends TestCase
{
    private AttendanceRepository&MockObject $attendanceRepo;
    private ClosurePeriodRepository&Stub $closureRepo;
    private LeaveRequestRepository&Stub $leaveRepo;
    private PlanService&Stub $planService;
    private CheckinService $svc;

    protected function setUp(): void
    {
        $this->attendanceRepo = $this->createMock(AttendanceRepository::class);
        $this->closureRepo = $this->createStub(ClosurePeriodRepository::class);
        $this->leaveRepo = $this->createStub(LeaveRequestRepository::class);
        $this->planService = $this->createStub(PlanService::class);

        $this->closureRepo->method('findActiveOnDate')->willReturn(null);
        $this->leaveRepo->method('findApprovedForEmployeeOnDate')->willReturn(null);
        // canUseShiftTimeRules() defaults to false on the stub → no per-day rule lookups.

        $this->svc = new CheckinService(
            $this->attendanceRepo,
            $this->closureRepo,
            $this->leaveRepo,
            new AttendanceFlagCalculator($this->planService),
        );
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
        parent::tearDown();
    }

    // ── Late on check-in ─────────────────────────────────────────────

    public function testNotLateWhenCheckInIsExactlyAtShiftStart(): void
    {
        $this->pinClockTo('2026-04-10 09:00:00');
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn(null);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $this->svc->checkin(
            $this->employeeWithShift(start: '09:00:00', end: '17:00:00'),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertNotNull($captured);
        $this->assertFalse($captured->isLate(), 'Equal to shift start → not late (strict >)');
    }

    public function testLateWhenCheckInExceedsShiftStart(): void
    {
        $this->pinClockTo('2026-04-10 09:01:00');
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn(null);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $this->svc->checkin(
            $this->employeeWithShift(start: '09:00:00', end: '17:00:00'),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertTrue($captured->isLate());
    }

    public function testGraceMinutesExtendsTheLateBoundary(): void
    {
        $this->pinClockTo('2026-04-10 09:05:00');
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn(null);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        // 5-minute grace → 09:05 still on time.
        $this->svc->checkin(
            $this->employeeWithShift(start: '09:00:00', end: '17:00:00', graceLate: 5),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertFalse($captured->isLate());
    }

    public function testLateOneMinutePastGraceWindow(): void
    {
        $this->pinClockTo('2026-04-10 09:06:00');
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn(null);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $this->svc->checkin(
            $this->employeeWithShift(start: '09:00:00', end: '17:00:00', graceLate: 5),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertTrue($captured->isLate());
    }

    public function testCheckInWithNoShiftAttachedNeverFlagsLate(): void
    {
        $this->pinClockTo('2026-04-10 23:59:00');
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn(null);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $emp = (new Employee())->setWorkspace(new Workspace());
        // No shift attached.

        $this->svc->checkin($emp, clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertFalse($captured->isLate(), 'No shift = no expectation = never late');
    }

    // ── Left-early on check-out ──────────────────────────────────────

    public function testNotLeftEarlyWhenCheckOutIsExactlyAtShiftEnd(): void
    {
        $this->pinClockTo('2026-04-10 17:00:00');
        $existing = $this->existingCheckInAttendance(deviceId: null);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);

        $this->attendanceRepo->expects($this->never())->method('persist');

        $this->svc->checkin(
            $this->employeeWithShift(start: '09:00:00', end: '17:00:00'),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertFalse($existing->hasLeftEarly(), 'Equal to shift end → not left early (strict <)');
        $this->assertNotNull($existing->getCheckOutAt());
    }

    public function testLeftEarlyWhenCheckOutIsBeforeShiftEnd(): void
    {
        $this->pinClockTo('2026-04-10 16:59:00');
        $existing = $this->existingCheckInAttendance(deviceId: null);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);

        $this->svc->checkin(
            $this->employeeWithShift(start: '09:00:00', end: '17:00:00'),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertTrue($existing->hasLeftEarly());
    }

    public function testEarlyGraceMinutesShrinksTheLeftEarlyBoundary(): void
    {
        $this->pinClockTo('2026-04-10 16:55:00');
        $existing = $this->existingCheckInAttendance(deviceId: null);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);

        // 5-minute early grace → 16:55 still acceptable.
        $this->svc->checkin(
            $this->employeeWithShift(start: '09:00:00', end: '17:00:00', graceEarly: 5),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertFalse($existing->hasLeftEarly());
    }

    public function testLeftEarlyOneMinutePastGraceWindow(): void
    {
        $this->pinClockTo('2026-04-10 16:54:00');
        $existing = $this->existingCheckInAttendance(deviceId: null);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);

        $this->svc->checkin(
            $this->employeeWithShift(start: '09:00:00', end: '17:00:00', graceEarly: 5),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertTrue($existing->hasLeftEarly());
    }

    public function testCheckOutWithNoShiftAttachedNeverFlagsLeftEarly(): void
    {
        $this->pinClockTo('2026-04-10 12:00:00');
        $existing = $this->existingCheckInAttendance(deviceId: null);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);

        $emp = (new Employee())->setWorkspace(new Workspace());

        $this->svc->checkin($emp, clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertFalse($existing->hasLeftEarly());
    }

    // ── Attendance tracking opt-out (None) ──────────────────────────

    public function testNoneTrackedEmployeeWithShiftIsNeverFlaggedAsLate(): void
    {
        $this->pinClockTo('2026-04-10 09:30:00');
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn(null);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        // 09:30 is 30 minutes late — but None-tracked employees never get the flag,
        // even though they DO get their check-in time recorded.
        $emp = $this->employeeWithShift(start: '09:00:00', end: '17:00:00');
        $emp->setAttendanceTracking(EmployeeAttendanceTrackingEnum::None);

        $this->svc->checkin($emp, clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertFalse($captured->isLate(), 'None-tracked → never late');
        $this->assertNotNull($captured->getCheckInAt(), 'But check-in time IS still recorded');
    }

    public function testNoneTrackedEmployeeIsNeverFlaggedAsLeftEarly(): void
    {
        $this->pinClockTo('2026-04-10 14:00:00');
        $existing = $this->existingCheckInAttendance(deviceId: null);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);

        $emp = $this->employeeWithShift(start: '09:00:00', end: '17:00:00');
        $emp->setAttendanceTracking(EmployeeAttendanceTrackingEnum::None);

        $this->svc->checkin($emp, clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertFalse($existing->hasLeftEarly(), 'None-tracked → never left early');
        $this->assertNotNull($existing->getCheckOutAt(), 'But check-out time IS still recorded');
    }

    // ── Per-day shift schedule = full schedule (off-day flag suppression) ─

    public function testCheckInOnOffDayDoesNotFireLateFlagWhenShiftHasPerDayRules(): void
    {
        // 2026-04-11 is a Saturday. The GM's shift has Mon-Fri rules only.
        // Even though check-in is at 10:00 (1h past the default 09:00), Saturday
        // is an off-day — no rule applies, no late flag fires.
        $this->pinClockTo('2026-04-11 10:00:00');
        $this->planService->method('canUseShiftTimeRules')->willReturn(true);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn(null);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $this->svc->checkin(
            $this->gmEmployeeWithWeekdayRules(),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertFalse($captured->isLate(), 'Saturday = off-day, no late flag even at 10:00');
    }

    public function testCheckOutOnOffDayDoesNotFireLeftEarlyFlag(): void
    {
        // Saturday check-out at 14:00 (3h before the default 17:00) — no flag because off-day.
        $this->pinClockTo('2026-04-11 14:00:00');
        $this->planService->method('canUseShiftTimeRules')->willReturn(true);
        $existing = $this->existingCheckInAttendance(deviceId: null);
        $existing->setCheckInAt(new DateTimeImmutable('2026-04-11 09:00:00'));
        $existing->setDate(new DateTimeImmutable('2026-04-11'));
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);

        $this->svc->checkin(
            $this->gmEmployeeWithWeekdayRules(),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );

        $this->assertFalse($existing->hasLeftEarly(), 'Saturday = off-day, no left-early flag');
    }

    public function testCheckInOnScheduledDayUsesPerDayRuleStart(): void
    {
        // Monday 07:30 — Monday rule says 08:00 start, so 07:30 is on time.
        $this->pinClockTo('2026-04-13 07:30:00');
        $this->planService->method('canUseShiftTimeRules')->willReturn(true);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn(null);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $emp = $this->gmEmployeeWithWeekdayRules(monStart: '08:00', monEnd: '16:00');
        $this->svc->checkin($emp, clientIp: '203.0.113.5', settings: $this->settings());

        $this->assertFalse($captured->isLate(), 'Monday rule 08:00 honored — 07:30 is early, not late');
    }

    // ── Timezone interaction ─────────────────────────────────────────

    public function testLateDetectionUsesWorkspaceLocalTimeNotUtc(): void
    {
        // 02:00 UTC == 09:00 Asia/Phnom_Penh (UTC+7). With workspace TZ Phnom Penh
        // and shift start 09:00, the employee is on time despite UTC clock showing 02:00.
        $this->pinClockTo('2026-04-10 02:00:00');
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn(null);

        $captured = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$captured): bool {
                $captured = $a;
                return true;
            }));

        $this->svc->checkin(
            $this->employeeWithShift(start: '09:00:00', end: '17:00:00'),
            clientIp: '203.0.113.5',
            settings: $this->settings(timezone: 'Asia/Phnom_Penh'),
        );

        $this->assertFalse($captured->isLate());
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private function pinClockTo(string $iso): void
    {
        DateService::setClock(new MockClock($iso, new DateTimeZone('UTC')));
    }

    private function employeeWithShift(
        string $start,
        string $end,
        int $graceLate = 0,
        int $graceEarly = 0,
    ): Employee {
        $shift = (new Shift())
            ->setStartTime(new DateTimeImmutable($start))
            ->setEndTime(new DateTimeImmutable($end))
            ->setGraceLateMinutes($graceLate)
            ->setGraceEarlyMinutes($graceEarly);
        $emp = (new Employee())->setShift($shift);
        $emp->setWorkspace(new Workspace());
        return $emp;
    }

    private function existingCheckInAttendance(?string $deviceId): Attendance
    {
        $att = (new Attendance())
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 09:00:00'))
            ->setCheckInDeviceId($deviceId);
        return $att;
    }

    /**
     * GM-style employee: shift with per-day rules covering Mon-Fri only.
     * Saturday + Sunday are off — flag calc should suppress late/early there.
     */
    private function gmEmployeeWithWeekdayRules(
        string $monStart = '09:00',
        string $monEnd = '17:00',
    ): Employee {
        $workspace = new Workspace();
        $shift = (new Shift())
            ->setWorkspace($workspace)
            ->setStartTime(new DateTimeImmutable('09:00:00'))
            ->setEndTime(new DateTimeImmutable('17:00:00'));
        $weekdays = [
            [DayOfWeekEnum::Monday, $monStart, $monEnd],
            [DayOfWeekEnum::Tuesday, '09:00', '17:00'],
            [DayOfWeekEnum::Wednesday, '09:00', '17:00'],
            [DayOfWeekEnum::Thursday, '09:00', '17:00'],
            [DayOfWeekEnum::Friday, '09:00', '17:00'],
        ];
        foreach ($weekdays as [$day, $start, $end]) {
            $shift->addTimeRule((new ShiftTimeRule())->setDayOfWeek($day)->setStartTime($start)->setEndTime($end));
        }
        $emp = (new Employee())->setShift($shift);
        $emp->setWorkspace($workspace);
        return $emp;
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
}

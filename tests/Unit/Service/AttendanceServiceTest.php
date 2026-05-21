<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Enum\EmployeeAttendanceTrackingEnum;
use App\Repository\AttendanceRepository;
use App\Service\AttendanceFlagCalculator;
use App\Service\AttendanceService;
use App\Service\DateService;
use App\Service\PlanService;
use DateTimeImmutable;
use DateTimeZone;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

#[AllowMockObjectsWithoutExpectations]
class AttendanceServiceTest extends TestCase
{
    private AttendanceRepository&MockObject $attendanceRepo;
    private PlanService&Stub $planService;
    private AttendanceService $svc;

    protected function setUp(): void
    {
        $this->attendanceRepo = $this->createMock(AttendanceRepository::class);
        $this->planService = $this->createStub(PlanService::class);

        $this->svc = new AttendanceService(
            $this->attendanceRepo,
            new AttendanceFlagCalculator($this->planService),
        );

        DateService::setClock(new MockClock('2026-04-10 18:00:00', new DateTimeZone('UTC')));
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
        parent::tearDown();
    }

    // ── Happy path: close a forgotten check-out ──────────────────────

    public function testSettingMissingCheckOutRecordsTimeAndAuditFields(): void
    {
        $attendance = $this->buildAttendance(
            checkIn: '2026-04-10 09:00:00',
            checkOut: null,
        );
        $actor = (new User())->setEmail('owner@example.com');

        $this->attendanceRepo->expects($this->once())->method('flush');

        $this->svc->override(
            attendance: $attendance,
            actor: $actor,
            checkInAt: null,
            checkOutAt: '17:30',
            checkInProvided: false,
            checkOutProvided: true,
            reason: 'Forgot to scan out',
        );

        $this->assertSame('17:30', $attendance->getCheckOutAt()?->setTimezone(new DateTimeZone('UTC'))->format('H:i'));
        $this->assertTrue($attendance->isEdited());
        $this->assertSame('owner@example.com', $attendance->getEditedByEmail());
        $this->assertSame('Forgot to scan out', $attendance->getEditReason());
        $this->assertSame($actor, $attendance->getEditedBy());
    }

    public function testFirstEditSnapshotsOriginalScanTimes(): void
    {
        $attendance = $this->buildAttendance(
            checkIn: '2026-04-10 09:00:00',
            checkOut: null,
        );

        $this->svc->override(
            attendance: $attendance,
            actor: $this->actor(),
            checkInAt: null,
            checkOutAt: '17:30',
            checkInProvided: false,
            checkOutProvided: true,
            reason: 'fix',
        );

        $this->assertSame('09:00', $attendance->getOriginalCheckInAt()?->format('H:i'));
        $this->assertNull($attendance->getOriginalCheckOutAt(), 'Null check-out captured as null original');
    }

    public function testSecondEditDoesNotOverwriteOriginals(): void
    {
        $attendance = $this->buildAttendance(
            checkIn: '2026-04-10 09:00:00',
            checkOut: null,
        );

        // First edit closes the day at 17:30
        $this->svc->override(
            $attendance, $this->actor(),
            checkInAt: null, checkOutAt: '17:30',
            checkInProvided: false, checkOutProvided: true,
            reason: 'first',
        );

        // Second edit shifts it to 18:00 — originals stay frozen
        $this->svc->override(
            $attendance, $this->actor(),
            checkInAt: null, checkOutAt: '18:00',
            checkInProvided: false, checkOutProvided: true,
            reason: 'second',
        );

        $this->assertSame('09:00', $attendance->getOriginalCheckInAt()?->format('H:i'));
        $this->assertNull($attendance->getOriginalCheckOutAt());
        $this->assertSame('18:00', $attendance->getCheckOutAt()?->setTimezone(new DateTimeZone('UTC'))->format('H:i'));
    }

    // ── Validation ───────────────────────────────────────────────────

    public function testRejectsEmptyReason(): void
    {
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('reason is required');

        $this->svc->override(
            $this->buildAttendance('2026-04-10 09:00:00', null),
            $this->actor(),
            checkInAt: null, checkOutAt: '17:30',
            checkInProvided: false, checkOutProvided: true,
            reason: '   ',
        );
    }

    public function testRejectsClearingCheckInWhileCheckOutIsSet(): void
    {
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Cannot clear check-in');

        $this->svc->override(
            $this->buildAttendance('2026-04-10 09:00:00', '2026-04-10 17:00:00'),
            $this->actor(),
            checkInAt: null, checkOutAt: null,
            checkInProvided: true, checkOutProvided: false,
            reason: 'oops',
        );
    }

    public function testRejectsCheckOutBeforeCheckIn(): void
    {
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Check-out must be at or after check-in');

        $this->svc->override(
            $this->buildAttendance('2026-04-10 09:00:00', null),
            $this->actor(),
            checkInAt: '09:00', checkOutAt: '08:00',
            checkInProvided: true, checkOutProvided: true,
            reason: 'typo',
        );
    }

    public function testRejectsMalformedTimeString(): void
    {
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('HH:MM format');

        $this->svc->override(
            $this->buildAttendance('2026-04-10 09:00:00', null),
            $this->actor(),
            checkInAt: null, checkOutAt: '25:99',
            checkInProvided: false, checkOutProvided: true,
            reason: 'fix',
        );
    }

    public function testRejectsWhenNeitherFieldProvided(): void
    {
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Nothing to update');

        $this->svc->override(
            $this->buildAttendance('2026-04-10 09:00:00', null),
            $this->actor(),
            checkInAt: null, checkOutAt: null,
            checkInProvided: false, checkOutProvided: false,
            reason: 'fix',
        );
    }

    // ── Flag recompute ───────────────────────────────────────────────

    public function testRecomputeFlagsLeftEarlyAfterOverride(): void
    {
        $attendance = $this->buildAttendance(
            checkIn: '2026-04-10 09:00:00',
            checkOut: null,
            shift: ['start' => '09:00:00', 'end' => '17:00:00'],
        );

        $this->svc->override(
            $attendance, $this->actor(),
            checkInAt: null, checkOutAt: '16:30',
            checkInProvided: false, checkOutProvided: true,
            reason: 'left early',
        );

        $this->assertTrue($attendance->hasLeftEarly());
        $this->assertFalse($attendance->isLate());
    }

    public function testNoneTrackedEmployeeNeverFlagged(): void
    {
        $attendance = $this->buildAttendance(
            checkIn: '2026-04-10 10:00:00', // 1h late on paper
            checkOut: null,
            shift: ['start' => '09:00:00', 'end' => '17:00:00'],
            tracking: EmployeeAttendanceTrackingEnum::None,
        );

        $this->svc->override(
            $attendance, $this->actor(),
            checkInAt: null, checkOutAt: '15:00', // 2h early on paper
            checkInProvided: false, checkOutProvided: true,
            reason: 'admin helper',
        );

        $this->assertFalse($attendance->isLate());
        $this->assertFalse($attendance->hasLeftEarly());
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private function actor(): User
    {
        return (new User())->setEmail('manager@example.com');
    }

    /**
     * @param array{start: string, end: string}|null $shift
     */
    private function buildAttendance(
        string $checkIn,
        ?string $checkOut,
        ?array $shift = null,
        EmployeeAttendanceTrackingEnum $tracking = EmployeeAttendanceTrackingEnum::Full,
    ): Attendance {
        $workspace = new Workspace();
        $setting = (new WorkspaceSetting())->setTimezone('UTC');
        $workspace->setSetting($setting);

        $emp = (new Employee())
            ->setWorkspace($workspace)
            ->setAttendanceTracking($tracking);

        if ($shift !== null) {
            $shiftEntity = (new Shift())
                ->setStartTime(new DateTimeImmutable($shift['start']))
                ->setEndTime(new DateTimeImmutable($shift['end']));
            $emp->setShift($shiftEntity);
        }

        $att = (new Attendance())
            ->setEmployee($emp)
            ->setWorkspace($workspace)
            ->setDate(new DateTimeImmutable('2026-04-10'))
            ->setCheckInAt(new DateTimeImmutable($checkIn));
        if ($checkOut !== null) {
            $att->setCheckOutAt(new DateTimeImmutable($checkOut));
        }
        return $att;
    }
}

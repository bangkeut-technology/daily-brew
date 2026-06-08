<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Entity\ClosurePeriod;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\Checkin\EffectiveCheckinSettings;
use App\Service\CheckinService;
use App\Service\AttendanceFlagCalculator;
use App\Service\DateService;
use App\Service\PlanService;
use DateTimeImmutable;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

#[AllowMockObjectsWithoutExpectations]
class CheckinServiceTest extends TestCase
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

        // Defaults — most tests don't care about these gates.
        $this->closureRepo->method('findActiveOnDate')->willReturn(null);
        $this->leaveRepo->method('findApprovedForEmployeeOnDate')->willReturn(null);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn(null);

        $this->svc = new CheckinService(
            $this->attendanceRepo,
            $this->closureRepo,
            $this->leaveRepo,
            new AttendanceFlagCalculator($this->planService),
        );
    }

    // ── IP restriction ────────────────────────────────────────────────

    public function testIpRestrictionRejectsClientNotInAllowedList(): void
    {
        $this->expectException(AccessDeniedHttpException::class);
        $this->expectExceptionMessage('Check-in not allowed from this location');

        $this->svc->checkin(
            $this->employee(),
            clientIp: '192.0.2.1',
            settings: $this->settings(ipEnabled: true, allowedIps: ['203.0.113.5']),
        );
    }

    public function testIpRestrictionAllowsClientInAllowedList(): void
    {
        $this->attendanceRepo->expects($this->once())->method('persist');
        $this->attendanceRepo->expects($this->once())->method('flush');

        $att = $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            settings: $this->settings(ipEnabled: true, allowedIps: ['203.0.113.5']),
        );

        $this->assertSame('203.0.113.5', $att->getIpAddress());
    }

    public function testIpRestrictionWithEmptyAllowedListDoesNotBlock(): void
    {
        // Enabled but empty — treated as "open" (don't block) per service logic.
        $this->attendanceRepo->expects($this->once())->method('persist');

        $this->svc->checkin(
            $this->employee(),
            clientIp: '198.51.100.7',
            settings: $this->settings(ipEnabled: true, allowedIps: []),
        );
    }

    // ── Geofence ──────────────────────────────────────────────────────

    public function testGeofenceRejectsWhenLocationMissing(): void
    {
        $this->expectException(AccessDeniedHttpException::class);
        $this->expectExceptionMessage('Location is required');

        $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            latitude: null,
            longitude: null,
            settings: $this->settings(
                geoEnabled: true,
                geoLat: 11.55,
                geoLng: 104.9,
                geoRadius: 50,
            ),
        );
    }

    public function testGeofenceRejectsWhenOutsideRadius(): void
    {
        $this->expectException(AccessDeniedHttpException::class);
        $this->expectExceptionMessage('away (allowed:');

        // Bangkok is ~520km from Phnom Penh — well outside any radius.
        $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            latitude: 13.75,
            longitude: 100.5,
            settings: $this->settings(
                geoEnabled: true,
                geoLat: 11.55,
                geoLng: 104.9,
                geoRadius: 100,
            ),
        );
    }

    public function testGeofenceAllowsWhenInsideRadius(): void
    {
        $this->attendanceRepo->expects($this->once())->method('persist');

        // Same coordinates → distance 0.
        $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            latitude: 11.55,
            longitude: 104.9,
            settings: $this->settings(
                geoEnabled: true,
                geoLat: 11.55,
                geoLng: 104.9,
                geoRadius: 100,
            ),
        );
    }

    // ── Closure ───────────────────────────────────────────────────────

    public function testClosureBlocksCheckIn(): void
    {
        $closure = (new ClosurePeriod())->setName('Khmer New Year');
        $this->closureRepo = $this->createStub(ClosurePeriodRepository::class);
        $this->closureRepo->method('findActiveOnDate')->willReturn($closure);
        $this->rebuildService();

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Khmer New Year');

        $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );
    }

    // ── Leave ─────────────────────────────────────────────────────────

    public function testApprovedFullDayLeaveBlocksCheckIn(): void
    {
        $leave = new LeaveRequest(); // isFullDay() == true
        $this->leaveRepo = $this->createStub(LeaveRequestRepository::class);
        $this->leaveRepo->method('findApprovedForEmployeeOnDate')->willReturn($leave);
        $this->rebuildService();

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('approved leave');

        $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );
    }

    public function testApprovedPartialDayLeaveDoesNotBlockCheckIn(): void
    {
        $leave = (new LeaveRequest())
            ->setStartTime(new DateTimeImmutable('09:00:00'))
            ->setEndTime(new DateTimeImmutable('12:00:00'));
        $this->leaveRepo = $this->createStub(LeaveRequestRepository::class);
        $this->leaveRepo->method('findApprovedForEmployeeOnDate')->willReturn($leave);
        $this->rebuildService();
        $this->attendanceRepo->expects($this->once())->method('persist');

        $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );
    }

    // ── Device verification ───────────────────────────────────────────

    public function testDeviceVerificationBlocksWhenAnotherEmployeeCheckedInWithSameDeviceToday(): void
    {
        $existingAttendance = (new Attendance())->setEmployee(new Employee());
        $this->attendanceRepo->method('findByDeviceIdAndDateExcludingEmployee')
            ->willReturn($existingAttendance);

        $this->expectException(AccessDeniedHttpException::class);
        $this->expectExceptionMessage('already been used to check in another employee');

        $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            deviceId: 'device-1234',
            settings: $this->settings(deviceEnabled: true),
        );
    }

    public function testDeviceVerificationBlocksCheckOutFromDifferentDevice(): void
    {
        $existing = (new Attendance())
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 09:00:00'))
            ->setCheckInDeviceId('device-original');
        $this->attendanceRepo = $this->createMock(AttendanceRepository::class);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);
        $this->rebuildService();

        $this->expectException(AccessDeniedHttpException::class);
        $this->expectExceptionMessage('same device');

        $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            deviceId: 'device-different',
            settings: $this->settings(deviceEnabled: true),
        );
    }

    // ── Already complete ──────────────────────────────────────────────

    public function testRejectsThirdScanWhenAlreadyCheckedInAndOut(): void
    {
        $existing = (new Attendance())
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 09:00:00'))
            ->setCheckOutAt(new DateTimeImmutable('2026-04-10 17:00:00'));
        $this->attendanceRepo = $this->createMock(AttendanceRepository::class);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);
        $this->rebuildService();

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Already checked in and out');

        $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            settings: $this->settings(),
        );
    }

    // ── Happy paths ───────────────────────────────────────────────────

    public function testCheckInPersistsNewAttendanceWithExpectedFields(): void
    {
        $employee = $this->employee();
        $persisted = null;
        $this->attendanceRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Attendance $a) use (&$persisted): bool {
                $persisted = $a;
                return true;
            }));
        $this->attendanceRepo->expects($this->once())->method('flush');

        $this->svc->checkin(
            $employee,
            clientIp: '203.0.113.5',
            latitude: 11.55,
            longitude: 104.9,
            deviceId: 'device-abc',
            deviceName: 'iPhone 15',
            settings: $this->settings(),
        );

        $this->assertNotNull($persisted);
        $this->assertSame($employee, $persisted->getEmployee());
        $this->assertNotNull($persisted->getCheckInAt());
        $this->assertNull($persisted->getCheckOutAt());
        $this->assertSame('203.0.113.5', $persisted->getIpAddress());
        $this->assertSame(11.55, $persisted->getCheckInLat());
        $this->assertSame(104.9, $persisted->getCheckInLng());
        $this->assertSame('device-abc', $persisted->getCheckInDeviceId());
        $this->assertSame('iPhone 15', $persisted->getCheckInDeviceName());
    }

    public function testCheckOutUpdatesExistingAttendance(): void
    {
        $existing = (new Attendance())
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 09:00:00'))
            ->setCheckInDeviceId('device-abc');
        $this->attendanceRepo = $this->createMock(AttendanceRepository::class);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);
        $this->rebuildService();

        $this->attendanceRepo->expects($this->never())->method('persist');
        $this->attendanceRepo->expects($this->once())->method('flush');

        $result = $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            deviceId: 'device-abc',
            settings: $this->settings(),
        );

        $this->assertSame($existing, $result);
        $this->assertNotNull($result->getCheckOutAt());
    }

    // ── NFC cooldown ──────────────────────────────────────────────────

    public function testNfcScanWithinCooldownReturnsExistingAttendanceUnchanged(): void
    {
        // Freeze "now" at 09:00:10 — 10 seconds after the original check-in.
        // That's well inside the default 15-minute cooldown.
        DateService::setClock(new MockClock(new DateTimeImmutable('2026-04-10 09:00:10', new \DateTimeZone('UTC'))));

        $original = (new Attendance())
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 09:00:00', new \DateTimeZone('UTC')));

        $employee = $this->employeeWithNfcCooldown(15);
        $this->attendanceRepo = $this->createMock(AttendanceRepository::class);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($original);
        $this->rebuildService();

        // No INSERT, no UPDATE — the second NFC tap is silently dropped.
        $this->attendanceRepo->expects($this->never())->method('persist');
        $this->attendanceRepo->expects($this->never())->method('flush');

        $result = $this->svc->checkin(
            $employee,
            clientIp: '203.0.113.5',
            settings: $this->settings(),
            source: CheckinService::SOURCE_NFC,
        );

        $this->assertSame($original, $result);
        $this->assertNull($result->getCheckOutAt(), 'check-out should not have been flipped on');
    }

    public function testNfcScanAfterCooldownChecksOutAsNormal(): void
    {
        // 16 minutes after check-in — outside the 15-minute default cooldown.
        DateService::setClock(new MockClock(new DateTimeImmutable('2026-04-10 09:16:00', new \DateTimeZone('UTC'))));

        $existing = (new Attendance())
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 09:00:00', new \DateTimeZone('UTC')));

        $employee = $this->employeeWithNfcCooldown(15);
        $this->attendanceRepo = $this->createMock(AttendanceRepository::class);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);
        $this->rebuildService();

        $this->attendanceRepo->expects($this->once())->method('flush');

        $result = $this->svc->checkin(
            $employee,
            clientIp: '203.0.113.5',
            settings: $this->settings(),
            source: CheckinService::SOURCE_NFC,
        );

        $this->assertNotNull($result->getCheckOutAt(), 'second tap after cooldown should be the check-out');
    }

    public function testQrScanWithinCooldownWindowStillProcesses(): void
    {
        // Same 10-second-after window — but origin is a QR scan, not NFC.
        // QR scans deliberately bypass the cooldown: a manager-initiated
        // QR scan is a conscious act, not a phantom NFC tap.
        DateService::setClock(new MockClock(new DateTimeImmutable('2026-04-10 09:00:10', new \DateTimeZone('UTC'))));

        $existing = (new Attendance())
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 09:00:00', new \DateTimeZone('UTC')));

        $employee = $this->employeeWithNfcCooldown(15);
        $this->attendanceRepo = $this->createMock(AttendanceRepository::class);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);
        $this->rebuildService();

        $this->attendanceRepo->expects($this->once())->method('flush');

        $result = $this->svc->checkin(
            $employee,
            clientIp: '203.0.113.5',
            settings: $this->settings(),
            source: null, // QR / button — not NFC
        );

        $this->assertNotNull($result->getCheckOutAt(), 'QR scan should always process, cooldown is NFC-only');
    }

    public function testNfcCooldownDisabledWhenIntervalIsZero(): void
    {
        DateService::setClock(new MockClock(new DateTimeImmutable('2026-04-10 09:00:10', new \DateTimeZone('UTC'))));

        $existing = (new Attendance())
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 09:00:00', new \DateTimeZone('UTC')));

        // intervalMinutes = 0 → cooldown turned off entirely, even for NFC.
        $employee = $this->employeeWithNfcCooldown(0);
        $this->attendanceRepo = $this->createMock(AttendanceRepository::class);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($existing);
        $this->rebuildService();

        $this->attendanceRepo->expects($this->once())->method('flush');

        $result = $this->svc->checkin(
            $employee,
            clientIp: '203.0.113.5',
            settings: $this->settings(),
            source: CheckinService::SOURCE_NFC,
        );

        $this->assertNotNull($result->getCheckOutAt());
    }

    public function testFirstNfcScanWithNoPriorAttendanceCreatesNormally(): void
    {
        DateService::setClock(new MockClock(new DateTimeImmutable('2026-04-10 09:00:00', new \DateTimeZone('UTC'))));

        // findByEmployeeAndDate already returns null by default — fresh day.
        $employee = $this->employeeWithNfcCooldown(15);
        $this->attendanceRepo->expects($this->once())->method('persist');
        $this->attendanceRepo->expects($this->once())->method('flush');

        $result = $this->svc->checkin(
            $employee,
            clientIp: '203.0.113.5',
            settings: $this->settings(),
            source: CheckinService::SOURCE_NFC,
        );

        $this->assertNotNull($result->getCheckInAt());
        $this->assertNull($result->getCheckOutAt());
    }

    // ── Void resurrection ─────────────────────────────────────────────

    public function testCheckInResurrectsExistingVoidedRowInPlace(): void
    {
        DateService::setClock(new MockClock(new DateTimeImmutable('2026-04-10 09:30:00', new \DateTimeZone('UTC'))));

        $voided = (new Attendance())
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 08:00:00', new \DateTimeZone('UTC')))
            ->setCheckOutAt(new DateTimeImmutable('2026-04-10 16:00:00', new \DateTimeZone('UTC')))
            ->setCheckInDeviceId('old-device')
            ->setCheckOutDeviceId('old-device');
        $voided->setVoidedAt(new DateTimeImmutable('2026-04-10 09:00:00', new \DateTimeZone('UTC')));
        $voided->setVoidedByEmail('owner@example.com');
        $voided->setVoidReason('wrong shift');

        $this->attendanceRepo = $this->createMock(AttendanceRepository::class);
        $this->attendanceRepo->method('findByEmployeeAndDate')->willReturn($voided);
        $this->rebuildService();

        // A resurrection reuses the existing row — no new persist.
        $this->attendanceRepo->expects($this->never())->method('persist');
        $this->attendanceRepo->expects($this->once())->method('flush');

        $result = $this->svc->checkin(
            $this->employee(),
            clientIp: '203.0.113.5',
            deviceId: 'new-device',
            deviceName: 'iPhone 16',
            settings: $this->settings(),
        );

        $this->assertSame($voided, $result);
        $this->assertFalse($result->isVoided());
        $this->assertNull($result->getVoidedByEmail());
        $this->assertNull($result->getVoidReason());
        $this->assertSame('09:30', $result->getCheckInAt()?->setTimezone(new \DateTimeZone('UTC'))->format('H:i'));
        $this->assertNull($result->getCheckOutAt(), 'check-out must be wiped — resurrection starts a fresh cycle');
        $this->assertSame('new-device', $result->getCheckInDeviceId());
    }

    protected function tearDown(): void
    {
        // Release the frozen clock so other tests run against real "now".
        DateService::setClock(null);
        parent::tearDown();
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private function employee(): Employee
    {
        $emp = new Employee();
        $emp->setWorkspace(new Workspace());
        return $emp;
    }

    private function employeeWithNfcCooldown(int $minutes): Employee
    {
        $workspace = new Workspace();
        $setting = new WorkspaceSetting();
        $setting->setWorkspace($workspace);
        $setting->setNfcCheckinIntervalMinutes($minutes);
        $workspace->setSetting($setting);

        $emp = new Employee();
        $emp->setWorkspace($workspace);
        return $emp;
    }

    private function settings(
        string $timezone = 'UTC',
        bool $ipEnabled = false,
        ?array $allowedIps = null,
        bool $geoEnabled = false,
        ?float $geoLat = null,
        ?float $geoLng = null,
        ?int $geoRadius = null,
        bool $deviceEnabled = false,
    ): EffectiveCheckinSettings {
        return new EffectiveCheckinSettings(
            timezone: $timezone,
            ipRestrictionEnabled: $ipEnabled,
            allowedIps: $allowedIps,
            geofencingEnabled: $geoEnabled,
            geofencingLatitude: $geoLat,
            geofencingLongitude: $geoLng,
            geofencingRadiusMeters: $geoRadius,
            deviceVerificationEnabled: $deviceEnabled,
        );
    }

    private function rebuildService(): void
    {
        // Some tests need to swap stubs after setUp; rebuild the SUT so it picks them up.
        $this->svc = new CheckinService(
            $this->attendanceRepo,
            $this->closureRepo,
            $this->leaveRepo,
            new AttendanceFlagCalculator($this->planService),
        );
    }
}

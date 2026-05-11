<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Workspace;
use App\Entity\WorkspaceQrCode;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

class AttendanceTest extends TestCase
{
    public function testNewAttendanceHasNoLateOrLeftEarlyFlagsSet(): void
    {
        $att = new Attendance();

        $this->assertFalse($att->isLate());
        $this->assertFalse($att->hasLeftEarly());
        $this->assertNull($att->getCheckInAt());
        $this->assertNull($att->getCheckOutAt());
    }

    public function testCheckInRoundTripStoresTimestampLocationAndDevice(): void
    {
        $now = new DateTimeImmutable('2026-04-10 09:05:00');
        $att = (new Attendance())
            ->setCheckInAt($now)
            ->setCheckInLat(11.55)
            ->setCheckInLng(104.9)
            ->setCheckInDeviceId('device-abc')
            ->setCheckInDeviceName('iPhone 15')
            ->setIpAddress('203.0.113.5');

        $this->assertSame($now, $att->getCheckInAt());
        $this->assertSame(11.55, $att->getCheckInLat());
        $this->assertSame(104.9, $att->getCheckInLng());
        $this->assertSame('device-abc', $att->getCheckInDeviceId());
        $this->assertSame('iPhone 15', $att->getCheckInDeviceName());
        $this->assertSame('203.0.113.5', $att->getIpAddress());
    }

    public function testCheckOutFieldsAreIndependentOfCheckInFields(): void
    {
        $att = (new Attendance())
            ->setCheckInDeviceId('device-abc')
            ->setCheckOutDeviceId('device-different');

        $this->assertSame('device-abc', $att->getCheckInDeviceId());
        $this->assertSame('device-different', $att->getCheckOutDeviceId());
    }

    public function testLateAndLeftEarlyFlagsAreIndependent(): void
    {
        $att = (new Attendance())->setIsLate(true);
        $this->assertTrue($att->isLate());
        $this->assertFalse($att->hasLeftEarly());

        $att->setLeftEarly(true);
        $this->assertTrue($att->hasLeftEarly());
        $this->assertTrue($att->isLate());

        $att->setIsLate(false);
        $this->assertFalse($att->isLate());
        $this->assertTrue($att->hasLeftEarly());
    }

    public function testRelationshipSettersStoreEmployeeWorkspaceAndQrCode(): void
    {
        $emp = new Employee();
        $ws = new Workspace();
        $qr = new WorkspaceQrCode();
        $att = (new Attendance())
            ->setEmployee($emp)
            ->setWorkspace($ws)
            ->setQrCode($qr);

        $this->assertSame($emp, $att->getEmployee());
        $this->assertSame($ws, $att->getWorkspace());
        $this->assertSame($qr, $att->getQrCode());
    }

    public function testQrCodeIsOptionalAndCanBeNullForMainQrCheckIns(): void
    {
        $att = new Attendance();

        $this->assertNull($att->getQrCode());

        $att->setQrCode(new WorkspaceQrCode())->setQrCode(null);

        $this->assertNull($att->getQrCode());
    }
}

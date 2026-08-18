<?php

declare(strict_types=1);

namespace App\Tests\Unit\DTO;

use App\DTO\AttendanceDTO;
use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Shift;
use DateTimeImmutable;
use DateTimeZone;
use PHPUnit\Framework\TestCase;

class AttendanceDTOTest extends TestCase
{
    public function testFromEntityCopiesCoreFieldsWithoutEmployeeByDefault(): void
    {
        $att = $this->attendance(
            date: '2026-04-10',
            checkIn: '2026-04-10 09:05:00',
            checkOut: '2026-04-10 17:30:00',
            isLate: true,
        );

        $dto = AttendanceDTO::fromEntity($att);

        $this->assertSame('2026-04-10', $dto->date);
        $this->assertSame('09:05', $dto->checkInAt);
        $this->assertSame('17:30', $dto->checkOutAt);
        $this->assertTrue($dto->isLate);
        $this->assertFalse($dto->leftEarly);
        $this->assertNull($dto->employeePublicId);
        $this->assertNull($dto->employeeName);
        $this->assertNull($dto->shiftName);
    }

    public function testFromEntityIncludesEmployeeFieldsWhenAsked(): void
    {
        $shift = (new Shift())->setName('Morning');
        $emp = (new Employee())
            ->setFirstName('Lyhour')
            ->setLastName('Huy')
            ->setShift($shift);
        $att = (new Attendance())
            ->setEmployee($emp)
            ->setDate(new DateTimeImmutable('2026-04-10'))
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 09:00:00'));

        $dto = AttendanceDTO::fromEntity($att, includeEmployee: true);

        $this->assertNotNull($dto->employeePublicId);
        $this->assertSame('Lyhour Huy', $dto->employeeName);
        $this->assertSame('Morning', $dto->shiftName);
    }

    public function testFromEntityFormatsTimestampsInProvidedTimezone(): void
    {
        $att = (new Attendance())
            ->setDate(new DateTimeImmutable('2026-04-10'))
            ->setCheckInAt(new DateTimeImmutable('2026-04-10 02:00:00', new DateTimeZone('UTC')));

        // Phnom Penh is UTC+7 → 02:00 UTC → 09:00 local
        $dto = AttendanceDTO::fromEntity($att, includeEmployee: false, tz: new DateTimeZone('Asia/Phnom_Penh'));

        $this->assertSame('09:00', $dto->checkInAt);
    }

    public function testFromEntityLeavesCheckInOutNullWhenAbsent(): void
    {
        $att = (new Attendance())->setDate(new DateTimeImmutable('2026-04-10'));

        $dto = AttendanceDTO::fromEntity($att);

        $this->assertNull($dto->checkInAt);
        $this->assertNull($dto->checkOutAt);
    }

    public function testToArrayOmitsEmployeeKeysWhenNotIncluded(): void
    {
        $att = $this->attendance(date: '2026-04-10', checkIn: null, checkOut: null);

        $array = AttendanceDTO::fromEntity($att)->toArray();

        $this->assertArrayNotHasKey('employeePublicId', $array);
        $this->assertArrayNotHasKey('employeeName', $array);
        $this->assertArrayNotHasKey('shiftName', $array);
    }

    public function testToArrayIncludesEmployeeKeysWhenIncluded(): void
    {
        $emp = (new Employee())->setFirstName('A')->setLastName('B');
        $att = (new Attendance())
            ->setEmployee($emp)
            ->setDate(new DateTimeImmutable('2026-04-10'));

        $array = AttendanceDTO::fromEntity($att, includeEmployee: true)->toArray();

        $this->assertArrayHasKey('employeePublicId', $array);
        $this->assertArrayHasKey('employeeName', $array);
        $this->assertArrayHasKey('shiftName', $array);
        $this->assertNull($array['shiftName'], 'No shift attached → shiftName key present but null');
    }

    // ── Overnight shifts ────────────────────────────────────────────

    public function testCheckOutOnTheSameDayIsNotFlaggedAsNextDay(): void
    {
        $dto = AttendanceDTO::fromEntity($this->attendance(
            date: '2026-04-10',
            checkIn: '2026-04-10 09:05:00',
            checkOut: '2026-04-10 17:30:00',
        ));

        $this->assertFalse($dto->checkOutNextDay);
        $this->assertFalse($dto->toArray()['checkOutNextDay']);
    }

    public function testOvernightCheckOutIsFlaggedAsNextDay(): void
    {
        // 18:00 → 02:00. Without the flag a consumer subtracting the two clock
        // times gets minus sixteen hours.
        $dto = AttendanceDTO::fromEntity($this->attendance(
            date: '2026-04-10',
            checkIn: '2026-04-10 18:00:00',
            checkOut: '2026-04-11 02:00:00',
        ));

        $this->assertTrue($dto->checkOutNextDay);
        $this->assertSame('18:00', $dto->checkInAt);
        $this->assertSame('02:00', $dto->checkOutAt);
    }

    public function testNextDayIsDecidedInTheWorkspaceTimezoneNotUtc(): void
    {
        // 19:30 UTC on the 10th is 02:30 on the 11th in Phnom Penh (UTC+7) —
        // the same instant is "next day" only once it is read locally.
        $att = $this->attendance(
            date: '2026-04-10',
            checkIn: '2026-04-10 11:00:00',
            checkOut: '2026-04-10 19:30:00',
        );

        $this->assertFalse(AttendanceDTO::fromEntity($att)->checkOutNextDay);
        $this->assertTrue(
            AttendanceDTO::fromEntity($att, tz: new DateTimeZone('Asia/Phnom_Penh'))->checkOutNextDay,
        );
    }

    public function testAMissingCheckOutIsNeverNextDay(): void
    {
        $dto = AttendanceDTO::fromEntity($this->attendance(
            date: '2026-04-10',
            checkIn: '2026-04-10 18:00:00',
            checkOut: null,
        ));

        $this->assertFalse($dto->checkOutNextDay);
    }

    private function attendance(
        string $date,
        ?string $checkIn,
        ?string $checkOut,
        bool $isLate = false,
        bool $leftEarly = false,
    ): Attendance {
        $att = (new Attendance())
            ->setDate(new DateTimeImmutable($date))
            ->setIsLate($isLate)
            ->setLeftEarly($leftEarly);
        if ($checkIn !== null) {
            $att->setCheckInAt(new DateTimeImmutable($checkIn));
        }
        if ($checkOut !== null) {
            $att->setCheckOutAt(new DateTimeImmutable($checkOut));
        }
        return $att;
    }
}

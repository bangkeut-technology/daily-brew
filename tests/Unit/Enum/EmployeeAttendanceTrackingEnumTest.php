<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\EmployeeAttendanceTrackingEnum;
use PHPUnit\Framework\TestCase;

class EmployeeAttendanceTrackingEnumTest extends TestCase
{
    public function testValuesLockedToBackingStrings(): void
    {
        // Doctrine stores the value not the case name — locking these in keeps
        // existing rows valid if anyone ever renames the cases.
        $this->assertSame('full', EmployeeAttendanceTrackingEnum::Full->value);
        $this->assertSame('none', EmployeeAttendanceTrackingEnum::None->value);
    }

    public function testTwoCases(): void
    {
        $this->assertCount(2, EmployeeAttendanceTrackingEnum::cases());
    }

    public function testLabels(): void
    {
        $this->assertSame('Tracked (default)', EmployeeAttendanceTrackingEnum::Full->label());
        $this->assertSame('Excluded from absent count', EmployeeAttendanceTrackingEnum::None->label());
    }

    public function testTryFromKnownAndUnknown(): void
    {
        $this->assertSame(EmployeeAttendanceTrackingEnum::Full, EmployeeAttendanceTrackingEnum::tryFrom('full'));
        $this->assertSame(EmployeeAttendanceTrackingEnum::None, EmployeeAttendanceTrackingEnum::tryFrom('none'));
        $this->assertNull(EmployeeAttendanceTrackingEnum::tryFrom('arrival_only'));
        $this->assertNull(EmployeeAttendanceTrackingEnum::tryFrom(''));
    }
}

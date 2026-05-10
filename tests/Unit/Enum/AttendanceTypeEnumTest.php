<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\AttendanceTypeEnum;
use PHPUnit\Framework\TestCase;

class AttendanceTypeEnumTest extends TestCase
{
    public function testValues(): void
    {
        $this->assertSame('present', AttendanceTypeEnum::PRESENT->value);
        $this->assertSame('absent', AttendanceTypeEnum::ABSENT->value);
        $this->assertSame('leave', AttendanceTypeEnum::LEAVE->value);
    }

    public function testLabels(): void
    {
        $this->assertSame('Present', AttendanceTypeEnum::PRESENT->label());
        $this->assertSame('Absent', AttendanceTypeEnum::ABSENT->label());
        $this->assertSame('On leave', AttendanceTypeEnum::LEAVE->label());
    }
}

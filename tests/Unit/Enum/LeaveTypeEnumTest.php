<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\LeaveTypeEnum;
use PHPUnit\Framework\TestCase;

class LeaveTypeEnumTest extends TestCase
{
    public function testValues(): void
    {
        $this->assertSame('paid', LeaveTypeEnum::PAID->value);
        $this->assertSame('unpaid', LeaveTypeEnum::UNPAID->value);
    }

    public function testLabels(): void
    {
        $this->assertSame('Paid leave', LeaveTypeEnum::PAID->label());
        $this->assertSame('Unpaid leave', LeaveTypeEnum::UNPAID->label());
    }
}

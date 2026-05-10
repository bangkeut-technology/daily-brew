<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\EmployeeStatusEnum;
use PHPUnit\Framework\TestCase;

class EmployeeStatusEnumTest extends TestCase
{
    public function testValues(): void
    {
        $this->assertSame('active', EmployeeStatusEnum::ACTIVE->value);
        $this->assertSame('inactive', EmployeeStatusEnum::INACTIVE->value);
    }

    public function testLabels(): void
    {
        $this->assertSame('Active', EmployeeStatusEnum::ACTIVE->label());
        $this->assertSame('Inactive', EmployeeStatusEnum::INACTIVE->label());
    }
}

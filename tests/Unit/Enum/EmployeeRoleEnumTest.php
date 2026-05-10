<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\EmployeeRoleEnum;
use PHPUnit\Framework\TestCase;

class EmployeeRoleEnumTest extends TestCase
{
    public function testValues(): void
    {
        $this->assertSame('employee', EmployeeRoleEnum::EMPLOYEE->value);
        $this->assertSame('manager', EmployeeRoleEnum::MANAGER->value);
    }

    public function testLabels(): void
    {
        $this->assertSame('Employee', EmployeeRoleEnum::EMPLOYEE->label());
        $this->assertSame('Manager', EmployeeRoleEnum::MANAGER->label());
    }

    public function testTryFromKnownAndUnknownValues(): void
    {
        $this->assertSame(EmployeeRoleEnum::MANAGER, EmployeeRoleEnum::tryFrom('manager'));
        $this->assertNull(EmployeeRoleEnum::tryFrom('owner'));
        $this->assertNull(EmployeeRoleEnum::tryFrom(''));
    }
}

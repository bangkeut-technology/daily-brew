<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Employee;
use App\Enum\EmployeeRoleEnum;
use App\Enum\ManagerPermissionEnum;
use PHPUnit\Framework\TestCase;

class EmployeeManagerPermissionsTest extends TestCase
{
    public function testNewEmployeeHasNoPermissionsAndIsNotManager(): void
    {
        $employee = new Employee();

        $this->assertSame(EmployeeRoleEnum::EMPLOYEE, $employee->getRole());
        $this->assertFalse($employee->isManager());
        $this->assertSame([], $employee->getManagerPermissions());
        $this->assertSame([], $employee->getManagerPermissionValues());
    }

    public function testSetManagerPermissionsAcceptsEnumInstances(): void
    {
        $employee = $this->managerEmployee();

        $employee->setManagerPermissions([
            ManagerPermissionEnum::MANAGE_LEAVE,
            ManagerPermissionEnum::MANAGE_ATTENDANCE,
        ]);

        $this->assertEqualsCanonicalizing(
            ['manage_leave', 'manage_attendance'],
            $employee->getManagerPermissionValues(),
        );
    }

    public function testSetManagerPermissionsAcceptsStrings(): void
    {
        $employee = $this->managerEmployee();

        $employee->setManagerPermissions(['manage_shifts', 'manage_closures']);

        $this->assertEqualsCanonicalizing(
            [ManagerPermissionEnum::MANAGE_SHIFTS, ManagerPermissionEnum::MANAGE_CLOSURES],
            $employee->getManagerPermissions(),
        );
    }

    public function testSetManagerPermissionsDropsUnknownValuesAndDeduplicates(): void
    {
        $employee = $this->managerEmployee();

        $employee->setManagerPermissions([
            'manage_leave',
            'manage_leave',
            'rogue_value',
            ManagerPermissionEnum::MANAGE_LEAVE,
        ]);

        $this->assertSame(['manage_leave'], $employee->getManagerPermissionValues());
    }

    public function testHasManagerPermissionReturnsFalseForNonManagerEvenWhenStored(): void
    {
        $employee = new Employee();
        // Role stays employee — even with values stored, the helper must short-circuit.
        $employee->setManagerPermissions([ManagerPermissionEnum::MANAGE_LEAVE]);

        $this->assertFalse($employee->isManager());
        $this->assertFalse($employee->hasManagerPermission(ManagerPermissionEnum::MANAGE_LEAVE));
    }

    public function testHasManagerPermissionTrueWhenGrantedAndManager(): void
    {
        $employee = $this->managerEmployee();
        $employee->setManagerPermissions([ManagerPermissionEnum::MANAGE_LEAVE]);

        $this->assertTrue($employee->hasManagerPermission(ManagerPermissionEnum::MANAGE_LEAVE));
        $this->assertFalse($employee->hasManagerPermission(ManagerPermissionEnum::MANAGE_EMPLOYEES));
    }

    public function testDemotionPathClearsPermissionsWhenCallerSetsEmptyList(): void
    {
        $employee = $this->managerEmployee();
        $employee->setManagerPermissions(ManagerPermissionEnum::defaults());
        $this->assertNotEmpty($employee->getManagerPermissionValues());

        $employee->setRole(EmployeeRoleEnum::EMPLOYEE);
        $employee->setManagerPermissions([]);

        $this->assertFalse($employee->isManager());
        $this->assertSame([], $employee->getManagerPermissionValues());
    }

    public function testManagerPermissionRoundTripPreservesOnlyKnownValues(): void
    {
        $employee = $this->managerEmployee();

        $employee->setManagerPermissions([
            'manage_employees',
            'manage_shifts',
            'manage_closures',
            'manage_leave',
            'manage_attendance',
            'manage_universe',
        ]);

        $this->assertEqualsCanonicalizing(
            [
                'manage_employees',
                'manage_shifts',
                'manage_closures',
                'manage_leave',
                'manage_attendance',
            ],
            $employee->getManagerPermissionValues(),
        );
    }

    private function managerEmployee(): Employee
    {
        $employee = new Employee();
        $employee->setRole(EmployeeRoleEnum::MANAGER);
        return $employee;
    }
}

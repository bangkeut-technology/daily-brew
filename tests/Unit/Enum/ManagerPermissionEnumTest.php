<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\ManagerPermissionEnum;
use PHPUnit\Framework\TestCase;

class ManagerPermissionEnumTest extends TestCase
{
    public function testValues(): void
    {
        $this->assertSame('manage_employees', ManagerPermissionEnum::MANAGE_EMPLOYEES->value);
        $this->assertSame('manage_shifts', ManagerPermissionEnum::MANAGE_SHIFTS->value);
        $this->assertSame('manage_closures', ManagerPermissionEnum::MANAGE_CLOSURES->value);
        $this->assertSame('manage_leave', ManagerPermissionEnum::MANAGE_LEAVE->value);
        $this->assertSame('manage_attendance', ManagerPermissionEnum::MANAGE_ATTENDANCE->value);
    }

    public function testDefaultsMatchPreFeatureManagerBehavior(): void
    {
        $defaults = ManagerPermissionEnum::defaults();

        $this->assertContainsOnlyInstancesOf(ManagerPermissionEnum::class, $defaults);
        $this->assertEqualsCanonicalizing(
            [ManagerPermissionEnum::MANAGE_LEAVE, ManagerPermissionEnum::MANAGE_ATTENDANCE],
            $defaults,
        );
    }

    public function testDefaultValuesReturnsStringList(): void
    {
        $this->assertEqualsCanonicalizing(
            ['manage_leave', 'manage_attendance'],
            ManagerPermissionEnum::defaultValues(),
        );
    }

    public function testSanitizeAcceptsStrings(): void
    {
        $sanitized = ManagerPermissionEnum::sanitize(['manage_leave', 'manage_shifts']);

        $this->assertEqualsCanonicalizing(
            [ManagerPermissionEnum::MANAGE_LEAVE, ManagerPermissionEnum::MANAGE_SHIFTS],
            $sanitized,
        );
    }

    public function testSanitizeAcceptsEnumInstances(): void
    {
        $sanitized = ManagerPermissionEnum::sanitize([
            ManagerPermissionEnum::MANAGE_EMPLOYEES,
            ManagerPermissionEnum::MANAGE_CLOSURES,
        ]);

        $this->assertEqualsCanonicalizing(
            [ManagerPermissionEnum::MANAGE_EMPLOYEES, ManagerPermissionEnum::MANAGE_CLOSURES],
            $sanitized,
        );
    }

    public function testSanitizeAcceptsMixedInput(): void
    {
        $sanitized = ManagerPermissionEnum::sanitize([
            'manage_leave',
            ManagerPermissionEnum::MANAGE_SHIFTS,
        ]);

        $this->assertEqualsCanonicalizing(
            [ManagerPermissionEnum::MANAGE_LEAVE, ManagerPermissionEnum::MANAGE_SHIFTS],
            $sanitized,
        );
    }

    public function testSanitizeDropsUnknownValues(): void
    {
        $sanitized = ManagerPermissionEnum::sanitize([
            'manage_leave',
            'manage_billing',
            'rogue_string',
            '',
        ]);

        $this->assertSame([ManagerPermissionEnum::MANAGE_LEAVE], $sanitized);
    }

    public function testSanitizeDeduplicates(): void
    {
        $sanitized = ManagerPermissionEnum::sanitize([
            'manage_leave',
            ManagerPermissionEnum::MANAGE_LEAVE,
            'manage_leave',
        ]);

        $this->assertSame([ManagerPermissionEnum::MANAGE_LEAVE], $sanitized);
    }

    public function testSanitizeReturnsEmptyArrayForEmptyInput(): void
    {
        $this->assertSame([], ManagerPermissionEnum::sanitize([]));
    }
}

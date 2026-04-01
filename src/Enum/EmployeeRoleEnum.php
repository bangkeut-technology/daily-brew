<?php

declare(strict_types=1);

namespace App\Enum;

enum EmployeeRoleEnum: string
{
    case EMPLOYEE = 'employee';
    case MANAGER = 'manager';

    public function label(): string
    {
        return match ($this) {
            self::EMPLOYEE => 'Employee',
            self::MANAGER => 'Manager',
        };
    }
}

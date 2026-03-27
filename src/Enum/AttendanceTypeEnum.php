<?php

declare(strict_types=1);

namespace App\Enum;

enum AttendanceTypeEnum: string
{
    case PRESENT = 'present';
    case ABSENT = 'absent';
    case LEAVE = 'leave';

    public function label(): string
    {
        return match ($this) {
            self::PRESENT => 'Present',
            self::ABSENT => 'Absent',
            self::LEAVE => 'On leave',
        };
    }
}

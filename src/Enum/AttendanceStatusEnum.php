<?php
declare(strict_types=1);

namespace App\Enum;

/**
 * Class AttendanceStatusEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum AttendanceStatusEnum: string
{
    case PRESENT = 'present';
    case ABSENT = 'absent';
    case LATE = 'late';
    case LEAVE = 'leave';
    case SICK = 'sick';

    public function label(): string
    {
        return match ($this) {
            self::PRESENT => 'Present',
            self::ABSENT => 'Absent',
            self::LATE => 'Late',
            self::LEAVE => 'Leave',
            self::SICK => 'Sick',
        };
    }
}

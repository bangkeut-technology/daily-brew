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
    case HOLIDAY = 'holiday';
    case REMOTE = 'remote';
    case UNKNOWN = 'unknown';
}

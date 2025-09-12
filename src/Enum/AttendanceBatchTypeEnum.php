<?php
declare(strict_types=1);

namespace App\Enum;

/**
 * Class AttendanceBatchTypeEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum AttendanceBatchTypeEnum: string
{
    case SICK = 'sick';
    case HOLIDAY = 'holiday';
    case CLOSURE = 'closure';
}

<?php
declare(strict_types=1);

namespace App\Enum;

/**
 * Class LeaveTypeEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum LeaveTypeEnum: string
{
    case PAID = 'paid';
    case UNPAID = 'unpaid';
}

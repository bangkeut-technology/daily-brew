<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Enum PayslipStatusEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum PayslipStatusEnum: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
}

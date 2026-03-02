<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Enum SalaryTypeEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum SalaryTypeEnum: string
{
    case MONTHLY = 'monthly';
    case DAILY = 'daily';
    case HOURLY = 'hourly';
}

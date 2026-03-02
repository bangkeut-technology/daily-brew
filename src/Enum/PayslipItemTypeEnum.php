<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Enum PayslipItemTypeEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum PayslipItemTypeEnum: string
{
    case BONUS = 'bonus';
    case ALLOWANCE = 'allowance';
    case DEDUCTION = 'deduction';
}

<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Enum PayrollRunStatusEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum PayrollRunStatusEnum: string
{
    case DRAFT = 'draft';
    case FINALIZED = 'finalized';
}

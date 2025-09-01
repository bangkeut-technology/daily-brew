<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Class EmployeeStatusEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum EmployeeStatusEnum: string
{
    case ACTIVE = 'active';
    case ON_LEAVE = 'on_leave';
    case SUSPENDED = 'suspended';
    case RESIGNED = 'resigned';
    case PROBATION = 'probation';
}

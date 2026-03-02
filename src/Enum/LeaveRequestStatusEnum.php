<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Class LeaveRequestStatusEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum LeaveRequestStatusEnum: string
{
    case PENDING  = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
}

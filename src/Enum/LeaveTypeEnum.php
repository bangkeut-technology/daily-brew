<?php

declare(strict_types=1);

namespace App\Enum;

enum LeaveTypeEnum: string
{
    case PAID = 'paid';
    case UNPAID = 'unpaid';

    public function label(): string
    {
        return match ($this) {
            self::PAID => 'Paid leave',
            self::UNPAID => 'Unpaid leave',
        };
    }
}

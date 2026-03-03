<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * ISO 8601 day of week: 1 = Monday, 7 = Sunday.
 */
enum DayOfWeekEnum: int
{
    case MONDAY    = 1;
    case TUESDAY   = 2;
    case WEDNESDAY = 3;
    case THURSDAY  = 4;
    case FRIDAY    = 5;
    case SATURDAY  = 6;
    case SUNDAY    = 7;

    public function label(): string
    {
        return match ($this) {
            self::MONDAY    => 'Monday',
            self::TUESDAY   => 'Tuesday',
            self::WEDNESDAY => 'Wednesday',
            self::THURSDAY  => 'Thursday',
            self::FRIDAY    => 'Friday',
            self::SATURDAY  => 'Saturday',
            self::SUNDAY    => 'Sunday',
        };
    }
}

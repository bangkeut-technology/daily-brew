<?php

declare(strict_types=1);

namespace App\Enum;

enum PlanEnum: string
{
    case Free = 'free';
    case Espresso = 'espresso';
    case DoubleEspresso = 'double_espresso';

    public function label(): string
    {
        return match ($this) {
            self::Free => 'Free',
            self::Espresso => 'Espresso',
            self::DoubleEspresso => 'Double Espresso',
        };
    }
}

<?php

namespace App\Enum;

enum Plan: string
{
    case Free = 'free';
    case BrewPlus = 'brew_plus';

    public function label(): string
    {
        return match ($this) {
            self::Free => 'Free',
            self::BrewPlus => 'Brew+',
        };
    }
}

<?php

declare(strict_types=1);

namespace App\Enum;

enum OAuthProviderEnum: string
{
    case APPLE = 'apple';
    case GOOGLE = 'google';
}

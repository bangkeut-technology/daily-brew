<?php

declare(strict_types=1);

namespace App\Enum;

enum UserRoleEnum: string
{
    case DEFAULT = 'ROLE_USER';
    case SUPER_ADMIN = 'ROLE_SUPER_ADMIN';
}

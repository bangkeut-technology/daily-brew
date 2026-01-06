<?php
declare(strict_types=1);

namespace App\Enum;

/**
 * Class WorkspaceRoleEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum WorkspaceRoleEnum: string
{
    case OWNER = 'OWNER';
    case ADMIN = 'ADMIN';
    case MANAGER = 'MANAGER';
    case EMPLOYEE = 'EMPLOYEE';
}

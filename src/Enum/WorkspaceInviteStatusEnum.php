<?php
/**
 * This file is part of the DailyBrew project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 1/6/26 8:37AM
 *
 * @see     https://dailybrew.work
 */

namespace App\Enum;

/**
 * Workspace invite status enumeration.
 */
enum WorkspaceInviteStatusEnum: string
{
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case REVOKED = 'revoked';
    case EXPIRED = 'expired';
}

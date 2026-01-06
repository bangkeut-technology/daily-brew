<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/17/25 10:59AM
 * @see     https://dailybrew.work
 * Copyright (c) 2025 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\Enum;

use Symfony\Component\HttpFoundation\Response;

/**
 *
 * Class ApiErrorCodeEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum ApiErrorCodeEnum: string
{
    // Generic
    case VALIDATION_ERROR = 'VALIDATION_ERROR';
    case UNAUTHORIZED = 'UNAUTHORIZED';
    case FORBIDDEN = 'FORBIDDEN';
    case NOT_FOUND = 'NOT_FOUND';
    case CONFLICT = 'CONFLICT';
    case BAD_REQUEST = 'BAD_REQUEST';
    case INTERNAL_ERROR = 'INTERNAL_ERROR';

    // Workspace / Ownership
    case OWNERSHIP_TRANSFER_REQUIRED = 'OWNERSHIP_TRANSFER_REQUIRED';
    case OWNERSHIP_TRANSFER_NOT_ALLOWED = 'OWNERSHIP_TRANSFER_NOT_ALLOWED';
    case WORKSPACE_MEMBER_NOT_FOUND = 'WORKSPACE_MEMBER_NOT_FOUND';
    case WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND';
    case WORKSPACE_DELETED = 'WORKSPACE_DELETED';

    // Account
    case USER_DELETED = 'USER_DELETED';
    case ACCOUNT_DELETION_BLOCKED = 'ACCOUNT_DELETION_BLOCKED';

    // Campaign / EntryPoint
    case CAMPAIGN_ARCHIVED = 'CAMPAIGN_ARCHIVED';
    case ENTRYPOINT_DISABLED = 'ENTRYPOINT_DISABLED';

    // Auth / Account
    case INVALID_PASSWORD = 'INVALID_PASSWORD';
    case ACCESS_DENIED = 'ACCESS_DENIED';

    case LIMIT_REACHED = 'LIMIT_REACHED';

    public function httpStatus(): int
    {
        return match ($this) {
            // 400
            self::BAD_REQUEST,
            self::LIMIT_REACHED,
            self::VALIDATION_ERROR,
            self::INVALID_PASSWORD => Response::HTTP_BAD_REQUEST,

            // 401
            self::UNAUTHORIZED => Response::HTTP_UNAUTHORIZED,

            // 403
            self::FORBIDDEN,
            self::ACCESS_DENIED,
            self::OWNERSHIP_TRANSFER_NOT_ALLOWED => Response::HTTP_FORBIDDEN,

            // 404
            self::NOT_FOUND,
            self::WORKSPACE_NOT_FOUND,
            self::WORKSPACE_MEMBER_NOT_FOUND => Response::HTTP_NOT_FOUND,

            // 409
            self::CONFLICT,
            self::OWNERSHIP_TRANSFER_REQUIRED,
            self::ACCOUNT_DELETION_BLOCKED => Response::HTTP_CONFLICT,

            // 410 (very nice touch)
            self::WORKSPACE_DELETED,
            self::USER_DELETED => Response::HTTP_GONE,

            // 423 (optional but expressive)
            self::CAMPAIGN_ARCHIVED,
            self::ENTRYPOINT_DISABLED => Response::HTTP_LOCKED,

            // 500
            self::INTERNAL_ERROR => Response::HTTP_INTERNAL_SERVER_ERROR,
        };
    }
}

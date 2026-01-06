<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/17/25 11:06AM
 * @see     https://adora.media
 * Copyright (c) 2025 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\Api;

use App\Enum\ApiErrorCodeEnum;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 *
 * Class ApiErrorResponder
 *
 * @package App\Api
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class ApiErrorResponder
{
    public function respond(
        ApiErrorCodeEnum $code,
        string $message,
        int $status,
        ?string $description = null,
        array $context = []
    ): JsonResponse {
        return new JsonResponse([
            'code' => $code->value,
            'message' => $message,
            'description' => $description,
            'context' => (object) $context,
        ], $status);
    }
}

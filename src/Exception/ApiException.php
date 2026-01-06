<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/17/25 10:28AM
 * @see     https://dailybrew.work
 * Copyright (c) 2025 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\Exception;

use App\Enum\ApiErrorCodeEnum;
use RuntimeException;

/**
 *
 * Class ApiException
 *
 * @package App\Exception
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class ApiException extends RuntimeException
{
    public function __construct(
        private readonly ApiErrorCodeEnum $codeEnum,
        private readonly array $context = [],
    ) {
        parent::__construct($codeEnum->value);
    }

    public function getCodeEnum(): ApiErrorCodeEnum
    {
        return $this->codeEnum;
    }

    public function getStatusCode(): int
    {
        return $this->codeEnum->httpStatus();
    }

    public function getContext(): array
    {
        return $this->context;
    }
}

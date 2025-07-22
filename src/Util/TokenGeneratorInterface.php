<?php

declare(strict_types=1);

namespace App\Util;

/**
 * Interface TokenGeneratorInterface.
 *
 * @author Vandeth Tho <thovandeth@gmail.com>
 */
interface TokenGeneratorInterface
{
    /**
     * Generate a token.
     */
    public function generateToken(): string;

    /**
     * Generate a token without underscore.
     */
    public function generateTokenWithoutUnderscore(): string;

    /**
     * Generate an alphanumeric token.
     */
    public function generateAlphanumericToken(): string;
}

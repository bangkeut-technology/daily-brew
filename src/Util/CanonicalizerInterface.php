<?php

namespace App\Util;

/**
 * Interface CanonicalizerInterface.
 *
 * @author Vandeth Tho <thovandeth@gmail.com>
 */
interface CanonicalizerInterface
{
    public function canonicalize($string): ?string;

    /**
     * Lowercase and replace spaces with underscores in the given string.
     */
    public function canonicalizeString(?string $string): ?string;
}

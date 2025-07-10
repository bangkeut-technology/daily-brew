<?php

namespace App\Util;

/**
 * Interface CanonicalizerInterface
 *
 * @package App\Utils
 * @author Vandeth Tho <thovandeth@gmail.com>
 */
interface CanonicalizerInterface
{
    /**
     * @param $string
     *
     * @return string|null
     */
    public function canonicalize($string): ?string;

    /**
     * Lowercase and replace spaces with underscores in the given string.
     *
     * @param string|null $string
     * @return string|null
     */
    public function canonicalizeString(?string $string): ?string;
}

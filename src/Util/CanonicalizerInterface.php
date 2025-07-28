<?php
declare(strict_types=1);


namespace App\Util;

/**
 * Interface CanonicalizerInterface.
 *
 * @author Vandeth Tho <thovandeth@gmail.com>
 */
interface CanonicalizerInterface
{
    /**
     * Canonicalize the given string.
     *
     * This method should convert the string to a canonical form, which may include
     * lowercasing, removing special characters, and replacing spaces with underscores.
     *
     * @param string|null $string The string to canonicalize.
     *
     * @return string|null The canonicalized string or null if the input is null.
     */
    public static function canonicalize(?string $string): ?string;
}

<?php

declare(strict_types=1);

namespace App\Util;

use Symfony\Component\String\Slugger\AsciiSlugger;

/**
 * Class Canonicalizer.
 *
 * @author Vandeth Tho <thovandeth@gmail.com>
 */
class Canonicalizer implements CanonicalizerInterface
{
    public static function canonicalize(?string $string): ?string
    {
        if (null === $string) {
            return null;
        }

        $encoding = mb_detect_encoding($string);
        return $encoding
            ? mb_convert_case($string, MB_CASE_LOWER, $encoding)
            : mb_convert_case($string, MB_CASE_LOWER);
    }

    /**
     * @inheritDoc
     */
    public static function asciiCanonicalize(?string $string): ?string
    {
        if (null === $string) {
            return null;
        }

        $slugger = new AsciiSlugger();
        return $slugger->slug($string)->lower()->toString();
    }
}

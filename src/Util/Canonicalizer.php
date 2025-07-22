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
    private AsciiSlugger $slugger;

    public function __construct()
    {
        $this->slugger = new AsciiSlugger();
    }

    public function canonicalize($string): ?string
    {
        if (null === $string) {
            return null;
        }

        $encoding = mb_detect_encoding($string);

        return $encoding
            ? mb_convert_case($string, MB_CASE_LOWER, $encoding)
            : mb_convert_case($string, MB_CASE_LOWER);
    }

    public function canonicalizeString(?string $string): string
    {
        return $this->slugger->slug($string)->lower()->toString();
    }
}

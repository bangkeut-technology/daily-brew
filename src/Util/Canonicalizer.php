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
    /**
     * @var AsciiSlugger
     */
    private AsciiSlugger $slugger;

    public function __construct()
    {
        $this->slugger = new AsciiSlugger();
    }

    /**
     * @inheritDoc
     */
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

    /**
     * @inheritDoc
     */
    public function canonicalizeString(?string $string): string
    {
        return $this->slugger->slug($string)->lower()->toString();
    }
}

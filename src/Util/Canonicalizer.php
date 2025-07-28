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
     * @inheritDoc
     */
    public static function canonicalize(?string $string): ?string
    {
        if (null === $string) {
            return null;
        }

        $slugger = new AsciiSlugger();
        return $slugger->slug($string)->lower()->toString();
    }
}

<?php

declare(strict_types=1);

namespace App\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;

/**
 * Class BooleanTransformer.
 *
 * @author Vandeth Tho <thovandeth@gmail.com>
 */
class BooleanTransformer implements DataTransformerInterface
{
    public function transform($value): mixed
    {
        return $value;
    }

    public function reverseTransform($value): bool
    {
        return null === $value ? false : filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}

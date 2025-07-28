<?php

declare(strict_types=1);

namespace App\Form\DataTransformer;

use DateTime;
use Exception;
use Symfony\Component\Form\DataTransformerInterface;

/**
 * Class DateTimeTransformer.
 *
 * @author Vandeth THO <thovandeth@gmail.com>
 */
class DateTimeTransformer implements DataTransformerInterface
{
    protected string $displayFormat;

    /**
     * DateTimeTransformer constructor.
     */
    public function __construct(string $displayFormat = 'Y-m-d')
    {
        $this->displayFormat = $displayFormat;
    }

    public function transform($value): mixed
    {
        return null === $value ? $value : $value->format($this->displayFormat);
    }

    /**
     * @throws Exception
     */
    public function reverseTransform($value): ?DateTime
    {
        return null === $value ? $value : new DateTime($value);
    }
}

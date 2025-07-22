<?php

declare(strict_types=1);

namespace App\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;

/**
 * Class DateTimeImmutableTransformer.
 *
 * @author Vandeth THO <thovandeth@gmail.com>
 */
class DateTimeImmutableTransformer implements DataTransformerInterface
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
     * @throws \Exception
     */
    public function reverseTransform($value): ?\DateTimeImmutable
    {
        return null === $value ? $value : new \DateTimeImmutable($value);
    }
}

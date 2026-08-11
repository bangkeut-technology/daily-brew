<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests\Support;

use Psr\Clock\ClockInterface;

final class FrozenClock implements ClockInterface
{
    public function __construct(private \DateTimeImmutable $now)
    {
    }

    public static function at(string $time): self
    {
        return new self(new \DateTimeImmutable($time, new \DateTimeZone('UTC')));
    }

    public function now(): \DateTimeImmutable
    {
        return $this->now;
    }

    public function move(string $modifier): void
    {
        $this->now = $this->now->modify($modifier);
    }
}

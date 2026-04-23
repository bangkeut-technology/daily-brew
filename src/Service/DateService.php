<?php

declare(strict_types=1);

namespace App\Service;

use DateTimeZone;

/**
 * Centralised date/time factory — every DateTime in the app goes through here.
 * Guarantees UTC storage and explicit workspace-TZ conversions.
 */
final class DateService
{
    private static DateTimeZone $utc;

    public static function utc(): DateTimeZone
    {
        return self::$utc ??= new DateTimeZone('UTC');
    }

    /** Current instant in UTC. */
    public static function now(): \DateTimeImmutable
    {
        return new \DateTimeImmutable('now', self::utc());
    }

    /** Midnight "today" in the given timezone (for date-based lookups). */
    public static function today(DateTimeZone $tz): \DateTimeImmutable
    {
        return new \DateTimeImmutable('today', $tz);
    }

    /** Relative expression in UTC (e.g. '+1 hour', '-14 days'). */
    public static function relative(string $expression): \DateTimeImmutable
    {
        return new \DateTimeImmutable($expression, self::utc());
    }

    /** Parse a date/time string as UTC (e.g. user-supplied '2026-04-01'). */
    public static function parse(string $value): \DateTimeImmutable
    {
        return new \DateTimeImmutable($value, self::utc());
    }

    /** Parse with a specific format and optional timezone (defaults to UTC). */
    public static function createFromFormat(string $format, string $value, ?DateTimeZone $tz = null): \DateTimeImmutable
    {
        $dt = \DateTimeImmutable::createFromFormat($format, $value, $tz ?? self::utc());
        if ($dt === false) {
            throw new \InvalidArgumentException(sprintf('Cannot parse "%s" with format "%s"', $value, $format));
        }

        return $dt;
    }

    /** Convert a workspace-local DateTimeImmutable to UTC for storage. */
    public static function toUtc(\DateTimeImmutable $dt): \DateTimeImmutable
    {
        return $dt->setTimezone(self::utc());
    }

    /** Build a mutable DateTime in UTC (for Doctrine `datetime` columns that expect DateTime). */
    public static function mutableNow(): \DateTime
    {
        return new \DateTime('now', self::utc());
    }

    /** Mutable DateTime from relative expression in UTC. */
    public static function mutableRelative(string $expression): \DateTime
    {
        return new \DateTime($expression, self::utc());
    }

    /** Mutable DateTime parsed as UTC. */
    public static function mutableParse(string $value): \DateTime
    {
        return new \DateTime($value, self::utc());
    }
}

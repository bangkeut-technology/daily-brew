<?php

declare(strict_types=1);

namespace App\Util;

use DateMalformedStringException;
use DateTime;
use DateTimeImmutable;
use DateTimeInterface;

/**
 * Class DateHelper.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class DateHelper
{
    /**
     * Converts a DateTimeInterface to DateTimeImmutable.
     *
     * @param DateTimeInterface|null $date the date to convert. If null, returns the current date and time.
     *
     * @return DateTimeImmutable
     * @throws DateMalformedStringException
     */
    public static function toImmutable(?DateTimeInterface $date): DateTimeImmutable
    {
        if ($date === null) {
            return new DateTimeImmutable();
        }

        if ($date instanceof DateTimeImmutable) {
            return $date;
        }

        if ($date instanceof DateTime) {
            return DateTimeImmutable::createFromMutable($date);
        }

        return new DateTimeImmutable($date->format(DateTimeInterface::ATOM));
    }

    /**
     * Converts a DateTimeInterface to DateTimeImmutable and returns the start of the day.
     *
     * @param DateTimeInterface $date the date to convert
     * @throws DateMalformedStringException
     */
    public static function startOfDay(DateTimeInterface $date): DateTimeImmutable
    {
        return self::toImmutable($date)->setTime(0, 0);
    }

    /**
     * Converts a DateTimeInterface to DateTimeImmutable and returns the end of the day.
     *
     * @param DateTimeInterface $date the date to convert
     *
     * @throws DateMalformedStringException
     */
    public static function endOfDay(DateTimeInterface $date): DateTimeImmutable
    {
        return self::toImmutable($date)->setTime(23, 59, 59);
    }

    /**
     * Returns the start and end of the current day.
     *
     * @return array{0: DateTimeImmutable, 1: DateTimeImmutable}
     *
     * @throws DateMalformedStringException
     */
    public static function todayRange(): array
    {
        $today = new DateTimeImmutable();

        return [
            self::startOfDay($today),
            self::endOfDay($today),
        ];
    }

    /**
     * Returns the start and end of the current month.
     *
     * @return array{0: DateTimeImmutable, 1: DateTimeImmutable}
     *
     * @throws DateMalformedStringException
     */
    public static function currentMonthRange(): array
    {
        $now = new DateTimeImmutable();

        return [
            self::startOfDay($now->modify('first day of this month')),
            self::endOfDay($now->modify('last day of this month')),
        ];
    }

    /**
     * Returns the start and end of the current year.
     *
     * @param DateTimeInterface|null $date the date to use for the year. If null, use the current date.
     *
     * @return DateTimeImmutable
     *
     * @throws DateMalformedStringException
     */
    public static function startOfMonth(?DateTimeInterface $date = null): DateTimeImmutable
    {
        return self::startOfDay(
            self::toImmutable($date)->modify('first day of this month')
        );
    }

    /**
     * Returns the end of the month for a given date.
     *
     * @param DateTimeInterface|null $date the date to use for the month. If null, use the current date.
     *
     * @return DateTimeImmutable
     * @throws DateMalformedStringException
     */
    public static function endOfMonth(?DateTimeInterface $date = null): DateTimeImmutable
    {
        return self::endOfDay(
            self::toImmutable($date)->modify('last day of this month')
        );
    }

    /**
     * Returns a range of dates from the start of the month to the end of the month.
     *
     * @param DateTimeInterface|string|null $from the start date (default: first day of this month)
     * @param DateTimeInterface|string|null $to   the end date (default: last day of this month)
     *
     * @return array{0: DateTimeImmutable, 1: DateTimeImmutable}
     *
     * @throws DateMalformedStringException
     */
    public static function fromToRange(
        DateTimeInterface|string|null $from = null,
        DateTimeInterface|string|null $to = null,
    ): array {
        $fromDate = match (true) {
            $from instanceof DateTimeInterface => self::toImmutable($from),
            is_string($from) => new DateTimeImmutable($from),
            default => new DateTimeImmutable('first day of this month'),
        };

        $toDate = match (true) {
            $to instanceof DateTimeInterface => self::toImmutable($to),
            is_string($to) => new DateTimeImmutable($to),
            default => new DateTimeImmutable('last day of this month'),
        };

        return [
            self::startOfDay($fromDate),
            self::endOfDay($toDate),
        ];
    }

    /**
     * Returns the start of the year for a given date.
     *
     * @param DateTimeInterface|null $date the date to use for the year. If null, use the current date.
     *
     * @return DateTimeImmutable
     *
     * @throws DateMalformedStringException
     */
    public static function startOfYear(?DateTimeInterface $date = null): DateTimeImmutable
    {
        return self::startOfDay(
            self::toImmutable($date)->modify('first day of January this year')
        );
    }

    /**
     * Returns the end of the year for a given date.
     *
     * @param DateTimeInterface|null $date the date to use for the year. If null, use the current date.
     *
     * @return DateTimeImmutable
     *
     * @throws DateMalformedStringException
     */
    public static function endOfYear(?DateTimeInterface $date = null): DateTimeImmutable
    {
        return self::endOfDay(
            self::toImmutable($date)->modify('last day of December this year')
        );
    }

    /**
     * Calculates the number of days between two dates.
     *
     * This method computes the difference in days between two specified dates.
     * If the $inclusive flag is set to true, the result includes both the start
     * and end dates in the count; otherwise, only the days in between are counted.
     *
     * @param DateTimeInterface $from      The starting date.
     * @param DateTimeInterface $to        The ending date.
     * @param bool              $inclusive Whether to include the start and end dates in the count.
     * @return int The number of days between the two dates, including the boundaries if $inclusive is true.
     */
    public static function daysBetween(DateTimeInterface $from, DateTimeInterface $to, bool $inclusive = false): int
    {
        $diff = $from->diff($to)->days;
        return $inclusive ? $diff + 1 : $diff;
    }
}

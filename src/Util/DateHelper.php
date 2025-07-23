<?php

declare(strict_types=1);

namespace App\Util;

use DateTime;
use DateTimeImmutable;
use DateTimeInterface;
use Exception;

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
     * @param DateTimeInterface $date the date to convert
     *
     * @throws Exception
     */
    public static function toImmutable(DateTimeInterface $date): DateTimeImmutable
    {
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
     *
     * @throws Exception
     */
    public static function startOfDay(DateTimeInterface $date): DateTimeImmutable
    {
        return self::toImmutable($date)->setTime(0, 0, 0);
    }

    /**
     * Converts a DateTimeInterface to DateTimeImmutable and returns the end of the day.
     *
     * @param DateTimeInterface $date the date to convert
     *
     * @throws Exception
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
     * @throws Exception
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
     * @throws Exception
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
     * @param DateTimeInterface $date the date to use for the year
     *
     * @throws Exception
     */
    public static function startOfMonth(DateTimeInterface $date): DateTimeImmutable
    {
        return self::startOfDay(
            self::toImmutable($date)->modify('first day of this month')
        );
    }

    /**
     * Returns the end of the month for a given date.
     *
     * @param DateTimeInterface $date the date to use for the month
     *
     * @throws Exception
     */
    public static function endOfMonth(DateTimeInterface $date): DateTimeImmutable
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
     * @throws Exception
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
}

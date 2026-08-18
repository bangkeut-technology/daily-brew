<?php

declare(strict_types=1);

namespace App\Service\Shift;

/**
 * The start/end times that actually apply to one employee on one shift day —
 * either the shift's defaults or the matching per-day ShiftTimeRule.
 *
 * Times are workspace-local wall-clock "HH:MM". Either side may be null: a
 * legacy shift can carry a start without an end, and callers suppress the
 * corresponding flag rather than guessing.
 *
 * Minutes are counted from **midnight of the shift day**, not from midnight of
 * the calendar day the punch happened on. That's what makes an overnight shift
 * expressible: "18:00 – 02:00" is 1080 → 1560, not 1080 → 120. Everything
 * downstream (late/left-early flags, the check-out look-back window) compares
 * against that single axis.
 */
final readonly class ResolvedShiftTimes
{
    public function __construct(
        public ?string $startTime,
        public ?string $endTime,
    ) {}

    /**
     * Does this shift run past midnight into the next calendar day?
     *
     * An end that is literally earlier in the day than the start is the only
     * signal we have — there is no explicit "overnight" flag on Shift, and
     * adding one would mean migrating every existing row to say "no". A shift
     * where both ends are equal is treated as same-day (degenerate, but it's
     * what the old code did).
     */
    public function crossesMidnight(): bool
    {
        if ($this->startTime === null || $this->endTime === null) {
            return false;
        }

        return $this->endTime < $this->startTime;
    }

    public function startMinutes(): ?int
    {
        return $this->startTime === null ? null : self::toMinutes($this->startTime);
    }

    /** Minutes from the shift day's midnight — exceeds 1440 for an overnight shift. */
    public function endMinutes(): ?int
    {
        if ($this->endTime === null) {
            return null;
        }

        return self::toMinutes($this->endTime) + ($this->crossesMidnight() ? 1440 : 0);
    }

    private static function toMinutes(string $hhmm): int
    {
        [$hours, $minutes] = array_map('intval', explode(':', $hhmm));

        return $hours * 60 + $minutes;
    }
}

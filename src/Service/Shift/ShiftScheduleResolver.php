<?php

declare(strict_types=1);

namespace App\Service\Shift;

use App\Entity\Shift;
use App\Enum\DayOfWeekEnum;
use App\Service\PlanService;

/**
 * Resolves which times a shift actually imposes on a given day.
 *
 * This was private duplication inside AttendanceFlagCalculator (one method for
 * the start, one for the end). Pulling it out matters for two reasons beyond
 * tidiness:
 *
 *  1. Start and end must come from the *same* day's rule. The old code resolved
 *     the start against the check-in's calendar date and the end against the
 *     check-out's — identical for a day shift, but an overnight check-out lands
 *     on the next calendar day and would read the next day's rule (or none).
 *  2. CheckinService and AttendanceService now need the same answer, to decide
 *     whether a post-midnight scan closes yesterday's row.
 *
 * Per-day rules stay Espresso-gated and keep their "complete schedule"
 * semantics: a shift with any rules is off on days without one, and we return
 * null rather than falling back to the default times.
 */
class ShiftScheduleResolver
{
    public function __construct(
        private readonly PlanService $planService,
    ) {}

    /**
     * @param \DateTimeInterface $shiftDate the day the shift *starts* — for an
     *                                      overnight shift that is the earlier
     *                                      of the two calendar days it spans
     *
     * @return ResolvedShiftTimes|null null when the shift is not scheduled at all on that day
     */
    public function resolveFor(Shift $shift, \DateTimeInterface $shiftDate): ?ResolvedShiftTimes
    {
        $workspace = $shift->getWorkspace();

        if ($workspace !== null
            && $this->planService->canUseShiftTimeRules($workspace)
            && $shift->hasAnyTimeRules()
        ) {
            $dayOfWeek = DayOfWeekEnum::tryFrom((int) $shiftDate->format('N'));
            if ($dayOfWeek === null) {
                return null;
            }

            $rule = $shift->getTimeRuleFor($dayOfWeek);

            return $rule === null
                ? null
                : new ResolvedShiftTimes($rule->getStartTime(), $rule->getEndTime());
        }

        return new ResolvedShiftTimes(
            $shift->getStartTime()?->format('H:i'),
            $shift->getEndTime()?->format('H:i'),
        );
    }
}

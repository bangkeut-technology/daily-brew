<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Shift;
use App\Enum\DayOfWeekEnum;

/**
 * Computes `isLate` / `leftEarly` flags for an Attendance against the employee's shift.
 *
 * Shared by:
 *   - CheckinService (live QR scans)
 *   - AttendanceService::override (manager edits)
 *
 * Comparisons happen in the workspace timezone — see CheckinService for the rationale.
 * `attendanceTracking=none` employees never get flagged.
 */
class AttendanceFlagCalculator
{
    public function __construct(
        private readonly PlanService $planService,
    ) {}

    /**
     * Recompute both flags on the attendance based on its current check-in/out times
     * and the employee's shift. Mutates the attendance in place.
     */
    public function recompute(Attendance $attendance, Employee $employee, \DateTimeZone $wsTz): void
    {
        $shift = $employee->getShift();

        if (!$employee->isAttendanceTracked() || $shift === null) {
            $attendance->setIsLate(false);
            $attendance->setLeftEarly(false);
            return;
        }

        $checkInAt = $attendance->getCheckInAt();
        if ($checkInAt === null) {
            $attendance->setIsLate(false);
            $attendance->setLeftEarly(false);
            return;
        }

        $localCheckIn = $checkInAt->setTimezone($wsTz);
        $shiftStart = $this->resolveEffectiveStartTime($shift, $localCheckIn);
        if ($shiftStart !== null) {
            $startMinutes = $this->timeToMinutes($shiftStart) + $shift->getGraceLateMinutes();
            $attendance->setIsLate($this->timeToMinutes($localCheckIn) > $startMinutes);
        } else {
            $attendance->setIsLate(false);
        }

        $checkOutAt = $attendance->getCheckOutAt();
        if ($checkOutAt === null) {
            $attendance->setLeftEarly(false);
            return;
        }

        $localCheckOut = $checkOutAt->setTimezone($wsTz);
        $shiftEnd = $this->resolveEffectiveEndTime($shift, $localCheckOut);
        if ($shiftEnd !== null) {
            $endMinutes = $this->timeToMinutes($shiftEnd) - $shift->getGraceEarlyMinutes();
            $attendance->setLeftEarly($this->timeToMinutes($localCheckOut) < $endMinutes);
        } else {
            $attendance->setLeftEarly(false);
        }
    }

    /**
     * Resolve the effective shift start time for a given date.
     *
     * If the shift has per-day rules and the workspace is on a plan that supports
     * them: a matching rule wins; no matching rule means today is an off-day, so
     * we return null and the caller suppresses the late flag. We deliberately do
     * NOT fall back to the default start time here — that was the old behavior
     * and it caused a GM with a Mon-Fri shift to fire a "late" flag on Saturday.
     *
     * A shift with no per-day rules at all (Free plan, or Espresso users who
     * haven't set per-day overrides) keeps the legacy semantics: the default
     * start time applies every day.
     */
    private function resolveEffectiveStartTime(Shift $shift, \DateTimeInterface $date): ?\DateTimeInterface
    {
        $workspace = $shift->getWorkspace();
        if ($workspace !== null
            && $this->planService->canUseShiftTimeRules($workspace)
            && $shift->hasAnyTimeRules()
        ) {
            $dayOfWeek = DayOfWeekEnum::tryFrom((int) $date->format('N'));
            if ($dayOfWeek === null) {
                return null;
            }
            $rule = $shift->getTimeRuleFor($dayOfWeek);
            return $rule === null ? null : (DateService::createFromFormat('H:i', $rule->getStartTime()) ?: null);
        }
        return $shift->getStartTime();
    }

    private function resolveEffectiveEndTime(Shift $shift, \DateTimeInterface $date): ?\DateTimeInterface
    {
        $workspace = $shift->getWorkspace();
        if ($workspace !== null
            && $this->planService->canUseShiftTimeRules($workspace)
            && $shift->hasAnyTimeRules()
        ) {
            $dayOfWeek = DayOfWeekEnum::tryFrom((int) $date->format('N'));
            if ($dayOfWeek === null) {
                return null;
            }
            $rule = $shift->getTimeRuleFor($dayOfWeek);
            return $rule === null ? null : (DateService::createFromFormat('H:i', $rule->getEndTime()) ?: null);
        }
        return $shift->getEndTime();
    }

    /**
     * See CheckinService::timeToMinutes — the H:i digits are wall-clock values regardless
     * of the DateTimeZone attached to the object.
     */
    private function timeToMinutes(\DateTimeInterface $time): int
    {
        return (int) $time->format('G') * 60 + (int) $time->format('i');
    }
}

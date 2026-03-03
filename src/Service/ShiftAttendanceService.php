<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Employee;
use App\Entity\ShiftTimeRule;
use App\Enum\AttendanceTypeEnum;
use DateTimeImmutable;

/**
 * Class ShiftAttendanceService
 *
 * Determines whether an employee clocked in late or left early based on
 * their assigned shift rules and configured grace periods.
 *
 * @package App\Service
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class ShiftAttendanceService
{
    /**
     * Determine the attendance type at clock-in time.
     *
     * Returns LATE if the employee clocked in after the shift start time plus
     * the configured late-grace period. Returns PRESENT otherwise (including
     * when the employee has no shift or no rule for today).
     */
    public function detectCheckInType(Employee $employee, DateTimeImmutable $clockIn): AttendanceTypeEnum
    {
        $rule = $this->getRuleForDay($employee, $clockIn);
        if (null === $rule) {
            return AttendanceTypeEnum::PRESENT;
        }

        $shift      = $rule->getShift();
        $shiftStart = $this->parseTime($rule->getStartTime(), $clockIn);
        $threshold  = $shiftStart->modify(sprintf('+%d minutes', $shift->getGraceLateMinutes()));

        return $clockIn > $threshold ? AttendanceTypeEnum::LATE : AttendanceTypeEnum::PRESENT;
    }

    /**
     * Determine the attendance type at clock-out time.
     *
     * If the employee left before (shift end − early-grace), the type is
     * updated to EARLY_LEAVE — unless the record is already LATE, in which
     * case LATE takes precedence. Returns the existing type unchanged when
     * the employee has no shift rule for today or left on time.
     */
    public function detectCheckOutType(
        Employee           $employee,
        DateTimeImmutable  $clockOut,
        AttendanceTypeEnum $currentType,
    ): AttendanceTypeEnum {
        $rule = $this->getRuleForDay($employee, $clockOut);
        if (null === $rule) {
            return $currentType;
        }

        $shift     = $rule->getShift();
        $shiftEnd  = $this->parseTime($rule->getEndTime(), $clockOut);
        $threshold = $shiftEnd->modify(sprintf('-%d minutes', $shift->getGraceEarlyMinutes()));

        if ($clockOut < $threshold) {
            // Late arrivals that also leave early stay LATE; on-time workers become EARLY_LEAVE.
            return $currentType === AttendanceTypeEnum::LATE
                ? AttendanceTypeEnum::LATE
                : AttendanceTypeEnum::EARLY_LEAVE;
        }

        return $currentType;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Find the shift time rule for the given employee on the day of $referenceTime.
     * Returns null if the employee has no shift or the shift has no rule for that day.
     */
    private function getRuleForDay(Employee $employee, DateTimeImmutable $referenceTime): ?ShiftTimeRule
    {
        $shift = $employee->getShift();
        if (null === $shift) {
            return null;
        }

        // PHP's 'N' format: 1=Monday … 7=Sunday (ISO 8601) — matches DayOfWeekEnum values.
        $todayDow = (int) $referenceTime->format('N');

        foreach ($shift->getTimeRules() as $rule) {
            if ($rule->getDayOfWeek()->value === $todayDow) {
                return $rule;
            }
        }

        return null;
    }

    /**
     * Parse an HH:MM string into a DateTimeImmutable on the same date as $anchor.
     */
    private function parseTime(string $hhmm, DateTimeImmutable $anchor): DateTimeImmutable
    {
        [$hour, $minute] = array_map('intval', explode(':', $hhmm));

        return $anchor->setTime($hour, $minute, 0);
    }
}

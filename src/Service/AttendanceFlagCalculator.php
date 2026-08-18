<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Service\Shift\ShiftScheduleResolver;

/**
 * Computes `isLate` / `leftEarly` flags for an Attendance against the employee's shift.
 *
 * Shared by:
 *   - CheckinService (live QR scans)
 *   - AttendanceService::override / ::create (manager edits and backfills)
 *
 * Comparisons happen in the workspace timezone — see CheckinService for the rationale.
 * `attendanceTracking=none` employees never get flagged.
 *
 * Both punches are measured on one axis: minutes since midnight of the
 * attendance's own date. A check-out that happened after midnight therefore
 * reads as 1560 ("26:00"), not 120, and compares correctly against an overnight
 * shift's end. Which day's per-day rule applies is likewise decided by the
 * attendance date, never by the calendar date a punch happened to land on.
 */
class AttendanceFlagCalculator
{
    public function __construct(
        private readonly ShiftScheduleResolver $scheduleResolver,
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

        $localCheckIn = \DateTimeImmutable::createFromInterface($checkInAt)->setTimezone($wsTz);
        // The shift day anchors everything. It is the attendance's own date;
        // only a row with no date at all (defensive) falls back to the check-in.
        $shiftDay = $attendance->getDate() ?? $localCheckIn;
        $times = $this->scheduleResolver->resolveFor($shift, $shiftDay);

        $startMinutes = $times?->startMinutes();
        if ($startMinutes !== null) {
            $attendance->setIsLate(
                $this->minutesFromShiftDay($localCheckIn, $shiftDay) > $startMinutes + $shift->getGraceLateMinutes()
            );
        } else {
            $attendance->setIsLate(false);
        }

        $checkOutAt = $attendance->getCheckOutAt();
        if ($checkOutAt === null) {
            $attendance->setLeftEarly(false);
            return;
        }

        $localCheckOut = \DateTimeImmutable::createFromInterface($checkOutAt)->setTimezone($wsTz);
        $endMinutes = $times?->endMinutes();
        if ($endMinutes !== null) {
            $attendance->setLeftEarly(
                $this->minutesFromShiftDay($localCheckOut, $shiftDay) < $endMinutes - $shift->getGraceEarlyMinutes()
            );
        } else {
            $attendance->setLeftEarly(false);
        }
    }

    /**
     * Wall-clock minutes between midnight of the shift day and the punch, in
     * workspace-local terms. A punch on the following calendar day carries
     * +1440 — that's what lets 02:00 read as later than an 18:00 start.
     *
     * The day delta is computed on the date strings so a DST transition between
     * the two days can't add or drop an hour: a shift is defined in wall-clock
     * time, and "02:00" means 02:00 on both sides of a clock change.
     */
    private function minutesFromShiftDay(\DateTimeImmutable $localPunch, \DateTimeInterface $shiftDay): int
    {
        $minutes = (int) $localPunch->format('G') * 60 + (int) $localPunch->format('i');

        $utc = DateService::utc();
        $punchDate = DateService::createFromFormat('!Y-m-d', $localPunch->format('Y-m-d'), $utc);
        $anchorDate = DateService::createFromFormat('!Y-m-d', $shiftDay->format('Y-m-d'), $utc);

        $diff = $anchorDate->diff($punchDate);
        $dayDelta = (int) $diff->days * ($diff->invert === 1 ? -1 : 1);

        return $minutes + $dayDelta * 1440;
    }
}

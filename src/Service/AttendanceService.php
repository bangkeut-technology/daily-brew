<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Workspace;
use App\Exception\AttendanceAlreadyExistsException;
use App\Repository\AttendanceRepository;
use App\Service\Shift\ShiftScheduleResolver;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Owner/manager edits to existing attendance records (typically used to close
 * out forgotten check-outs). On first edit, the raw scan times are snapshotted
 * to originalCheckInAt/originalCheckOutAt so they survive subsequent edits.
 *
 * Live check-ins flow through CheckinService instead.
 *
 * The actor is an `AuditActor` rather than a User because the same paths serve
 * external integrations, which have a signing key instead of a person.
 */
class AttendanceService
{
    public function __construct(
        private readonly AttendanceRepository $attendanceRepository,
        private readonly AttendanceFlagCalculator $flagCalculator,
        private readonly ShiftScheduleResolver $scheduleResolver,
    ) {}

    /**
     * Apply a manager override. Times are workspace-local "HH:MM" (or null to clear).
     *
     * @throws BadRequestHttpException on validation failure
     */
    public function override(
        Attendance $attendance,
        AuditActor $actor,
        ?string $checkInAt,
        ?string $checkOutAt,
        bool $checkInProvided,
        bool $checkOutProvided,
        string $reason,
    ): Attendance {
        $reason = trim($reason);
        if ($reason === '') {
            throw new BadRequestHttpException('A reason is required for attendance edits.');
        }
        if (mb_strlen($reason) > 255) {
            throw new BadRequestHttpException('Reason must be 255 characters or fewer.');
        }
        if (!$checkInProvided && !$checkOutProvided) {
            throw new BadRequestHttpException('Nothing to update — provide checkInAt and/or checkOutAt.');
        }
        if ($attendance->isVoided()) {
            throw new BadRequestHttpException('This attendance has been voided — restore it before editing.');
        }

        $workspace = $attendance->getWorkspace() ?? $attendance->getEmployee()?->getWorkspace();
        $wsTz = new \DateTimeZone($workspace?->getSetting()?->getTimezone() ?? 'UTC');
        $date = $attendance->getDate();
        if ($date === null) {
            throw new BadRequestHttpException('Attendance has no date — cannot edit.');
        }

        $newCheckIn = $checkInProvided
            ? $this->parseTimeOnDate($checkInAt, $date, $wsTz, 'checkInAt')
            : $attendance->getCheckInAt();
        $newCheckOut = $checkOutProvided
            ? $this->parseCheckOut($checkOutAt, $date, $wsTz, $attendance->getEmployee(), $newCheckIn)
            : $attendance->getCheckOutAt();

        if ($newCheckIn === null && $newCheckOut !== null) {
            throw new BadRequestHttpException('Cannot clear check-in while a check-out is set.');
        }
        if ($newCheckIn !== null && $newCheckOut !== null && $newCheckOut < $newCheckIn) {
            throw new BadRequestHttpException('Check-out must be at or after check-in.');
        }

        // Snapshot originals exactly once — preserves the raw scan even across multiple edits.
        if (!$attendance->isEdited()) {
            $attendance->setOriginalCheckInAt($attendance->getCheckInAt());
            $attendance->setOriginalCheckOutAt($attendance->getCheckOutAt());
        }

        $attendance->setCheckInAt($newCheckIn);
        $attendance->setCheckOutAt($newCheckOut);

        $employee = $attendance->getEmployee();
        if ($employee !== null) {
            $this->flagCalculator->recompute($attendance, $employee, $wsTz);
        } else {
            $attendance->setIsLate(false);
            $attendance->setLeftEarly(false);
        }

        $attendance->setEditedAt(DateService::now());
        $attendance->setEditedBy($actor->user);
        $attendance->setEditedByEmail($actor->label);
        $attendance->setEditReason($reason);

        $this->attendanceRepository->flush();

        return $attendance;
    }

    /**
     * Manually record an attendance row for a past/current day (e.g. backfill a
     * day the employee forgot to scan, or correct for a broken QR). Times are
     * workspace-local "HH:MM"; a check-in is required, check-out is optional.
     * Throws AttendanceAlreadyExistsException if a row already exists for the
     * (employee, date) pair so the caller can offer to edit it instead.
     *
     * @throws BadRequestHttpException on validation failure
     * @throws AttendanceAlreadyExistsException if a row already exists for that day
     */
    public function create(
        Workspace $workspace,
        Employee $employee,
        AuditActor $actor,
        string $date,
        ?string $checkInAt,
        ?string $checkOutAt,
        string $reason,
    ): Attendance {
        $reason = trim($reason);
        if ($reason === '') {
            throw new BadRequestHttpException('A reason is required for attendance edits.');
        }
        if (mb_strlen($reason) > 255) {
            throw new BadRequestHttpException('Reason must be 255 characters or fewer.');
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            throw new BadRequestHttpException('date must be in YYYY-MM-DD format.');
        }

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        // "!" resets the time component to midnight so only the calendar date matters.
        $dateImmutable = DateService::createFromFormat('!Y-m-d', $date, $wsTz);

        if ($dateImmutable->format('Y-m-d') > DateService::today($wsTz)->format('Y-m-d')) {
            throw new BadRequestHttpException('Cannot add attendance for a future date.');
        }

        $checkIn = $this->parseTimeOnDate($checkInAt, $dateImmutable, $wsTz, 'checkInAt');
        if ($checkIn === null) {
            throw new BadRequestHttpException('A check-in time is required.');
        }
        $checkOut = $this->parseCheckOut($checkOutAt, $dateImmutable, $wsTz, $employee, $checkIn);
        if ($checkOut !== null && $checkOut < $checkIn) {
            throw new BadRequestHttpException('Check-out must be at or after check-in.');
        }

        $existing = $this->attendanceRepository->findByEmployeeAndDate($employee, $dateImmutable);
        if ($existing !== null) {
            // A voided row holds the unique (employee, date) slot but is logically
            // deleted — resurrect it in-place rather than 409'ing the operator into
            // a dead end. The void audit is preserved in the application log (the
            // create event below stamps a fresh editedBy/at/reason for traceability).
            if ($existing->isVoided()) {
                $existing->clearVoid();
                $existing->setQrCode(null);
                $existing->setIpAddress(null);
                $existing->setCheckInLat(null)->setCheckInLng(null);
                $existing->setCheckOutLat(null)->setCheckOutLng(null);
                $existing->setCheckInDeviceId(null)->setCheckInDeviceName(null);
                $existing->setCheckOutDeviceId(null)->setCheckOutDeviceName(null);
                $existing->setOriginalCheckInAt(null)->setOriginalCheckOutAt(null);
                $existing->setCheckInAt($checkIn);
                $existing->setCheckOutAt($checkOut);

                $this->flagCalculator->recompute($existing, $employee, $wsTz);

                $existing->setEditedAt(DateService::now());
                $existing->setEditedBy($actor->user);
                $existing->setEditedByEmail($actor->label);
                $existing->setEditReason($reason);

                $this->attendanceRepository->flush();

                return $existing;
            }

            throw new AttendanceAlreadyExistsException($existing);
        }

        $attendance = (new Attendance())
            ->setEmployee($employee)
            ->setWorkspace($workspace)
            ->setDate($dateImmutable)
            ->setCheckInAt($checkIn)
            ->setCheckOutAt($checkOut);

        $this->flagCalculator->recompute($attendance, $employee, $wsTz);

        // A manual entry is an audited action — stamp who recorded it and why.
        $attendance->setEditedAt(DateService::now());
        $attendance->setEditedBy($actor->user);
        $attendance->setEditedByEmail($actor->label);
        $attendance->setEditReason($reason);

        $this->attendanceRepository->persist($attendance);
        $this->attendanceRepository->flush();

        return $attendance;
    }

    /**
     * Soft-void an attendance row. The row stays in the database — preserving
     * the unique (employee, date) slot and the historical scan times — but
     * stats, the BasilBook export, and dashboard "present" feeds exclude it.
     * A subsequent QR check-in or manual entry on the same day resurrects the
     * row by clearing the void audit (see create() and CheckinService).
     *
     * @throws BadRequestHttpException on missing/invalid reason or double-void
     */
    public function void(Attendance $attendance, AuditActor $actor, string $reason): Attendance
    {
        $reason = trim($reason);
        if ($reason === '') {
            throw new BadRequestHttpException('A reason is required to delete attendance.');
        }
        if (mb_strlen($reason) > 255) {
            throw new BadRequestHttpException('Reason must be 255 characters or fewer.');
        }
        if ($attendance->isVoided()) {
            throw new BadRequestHttpException('This attendance has already been voided.');
        }

        $attendance->setVoidedAt(DateService::now());
        $attendance->setVoidedBy($actor->user);
        $attendance->setVoidedByEmail($actor->label);
        $attendance->setVoidReason($reason);

        $this->attendanceRepository->flush();

        return $attendance;
    }

    /**
     * Parse a check-out entered as workspace-local "HH:MM" against an
     * attendance date, rolling it onto the following day when the employee's
     * shift for that date runs past midnight.
     *
     * Operators type what the clock said — "02:00" for someone who finished at
     * two in the morning — and the row they are editing is still filed under
     * the day the shift started. Without the roll, that check-out lands eight
     * hours *before* the 18:00 check-in and the edit is rejected outright,
     * leaving no way at all to record an overnight day by hand.
     *
     * Inferred from the shift rather than taken as a request flag: a check-out
     * before the check-in is only meaningful when the schedule says the shift
     * spans midnight, and inferring it keeps both frontends unchanged. An
     * employee with no shift (or a day-shift one) still gets the old rejection.
     */
    private function parseCheckOut(
        ?string $hhmm,
        \DateTimeImmutable $date,
        \DateTimeZone $wsTz,
        ?Employee $employee,
        ?\DateTimeImmutable $checkIn,
    ): ?\DateTimeImmutable {
        $checkOut = $this->parseTimeOnDate($hhmm, $date, $wsTz, 'checkOutAt');

        if ($checkOut === null || $checkIn === null || $checkOut >= $checkIn) {
            return $checkOut;
        }

        $shift = $employee?->getShift();
        if ($shift === null) {
            return $checkOut;
        }

        $times = $this->scheduleResolver->resolveFor($shift, $date);
        if ($times === null || !$times->crossesMidnight()) {
            return $checkOut;
        }

        // Re-parse against the next calendar day rather than adding 24 hours to
        // the UTC instant — a DST change in the workspace timezone would make
        // those two answers differ, and "02:00 local" is what was meant.
        return $this->parseTimeOnDate($hhmm, $date->modify('+1 day'), $wsTz, 'checkOutAt');
    }

    private function parseTimeOnDate(?string $hhmm, \DateTimeImmutable $date, \DateTimeZone $wsTz, string $field): ?\DateTimeImmutable
    {
        if ($hhmm === null || $hhmm === '') {
            return null;
        }
        if (!preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $hhmm)) {
            throw new BadRequestHttpException(sprintf('%s must be in HH:MM format.', $field));
        }
        $local = DateService::createFromFormat(
            'Y-m-d H:i',
            $date->format('Y-m-d') . ' ' . $hhmm,
            $wsTz,
        );
        return DateService::toUtc($local);
    }
}

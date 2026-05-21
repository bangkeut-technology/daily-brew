<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Attendance;
use App\Entity\User;
use App\Repository\AttendanceRepository;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Owner/manager edits to existing attendance records (typically used to close
 * out forgotten check-outs). On first edit, the raw scan times are snapshotted
 * to originalCheckInAt/originalCheckOutAt so they survive subsequent edits.
 *
 * Live check-ins flow through CheckinService instead.
 */
class AttendanceService
{
    public function __construct(
        private readonly AttendanceRepository $attendanceRepository,
        private readonly AttendanceFlagCalculator $flagCalculator,
    ) {}

    /**
     * Apply a manager override. Times are workspace-local "HH:MM" (or null to clear).
     *
     * @throws BadRequestHttpException on validation failure
     */
    public function override(
        Attendance $attendance,
        User $actor,
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
            ? $this->parseTimeOnDate($checkOutAt, $date, $wsTz, 'checkOutAt')
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
        $attendance->setEditedBy($actor);
        $attendance->setEditedByEmail($actor->getEmail());
        $attendance->setEditReason($reason);

        $this->attendanceRepository->flush();

        return $attendance;
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

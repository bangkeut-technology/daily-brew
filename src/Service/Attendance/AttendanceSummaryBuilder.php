<?php

declare(strict_types=1);

namespace App\Service\Attendance;

use App\Entity\Employee;
use App\Entity\Workspace;
use App\Enum\DayOfWeekEnum;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\DateService;
use App\Service\PlanService;

/**
 * Builds the per-employee, per-day attendance grid for a date range — the
 * "Monthly" / gantt view. One entry per employee, each carrying a `days` list
 * where every day resolves to a single status (present / absent / leave / off /
 * closure / upcoming / voided).
 *
 * Shared by the `/attendances/summary` endpoint (on-screen gantt) and the
 * gantt-style XLSX/PDF export so the two can never drift. The caller decides
 * *which* employees to include (owner/manager scope); this service only fills
 * in their days.
 */
class AttendanceSummaryBuilder
{
    public function __construct(
        private readonly AttendanceRepository $attendanceRepository,
        private readonly LeaveRequestRepository $leaveRequestRepository,
        private readonly ClosurePeriodRepository $closurePeriodRepository,
        private readonly PlanService $planService,
    ) {}

    /**
     * @param list<Employee> $employees
     *
     * @return list<array{employeePublicId: string, employeeName: string, shiftName: string|null, days: list<array<string, mixed>>}>
     */
    public function build(Workspace $workspace, \DateTimeInterface $from, \DateTimeInterface $to, array $employees): array
    {
        if (empty($employees)) {
            return [];
        }

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $fromDate = \DateTime::createFromInterface($from);
        $toDate = \DateTime::createFromInterface($to);

        // Index attendance records by (employeeId, date)
        $attendances = $this->attendanceRepository->findByWorkspaceAndDateRange($workspace, $fromDate, $toDate);
        $attendanceMap = [];
        foreach ($attendances as $a) {
            $key = $a->getEmployee()->getId() . '_' . $a->getDate()->format('Y-m-d');
            $attendanceMap[$key] = $a;
        }

        // Collect closure dates in range
        $closureDates = [];
        $closures = $this->closurePeriodRepository->findByWorkspace($workspace);
        foreach ($closures as $closure) {
            $cStart = max($fromDate->getTimestamp(), $closure->getStartDate()->getTimestamp());
            $cEnd = min($toDate->getTimestamp(), $closure->getEndDate()->getTimestamp());
            $current = new \DateTime('@' . $cStart);
            $end = new \DateTime('@' . $cEnd);
            while ($current <= $end) {
                $closureDates[$current->format('Y-m-d')] = true;
                $current->modify('+1 day');
            }
        }

        // Collect approved leaves indexed by (employeeId, date)
        $leaveMap = [];
        foreach ($employees as $emp) {
            $leaves = $this->leaveRequestRepository->findApprovedInRange($emp, $fromDate, $toDate);
            foreach ($leaves as $leave) {
                $lStart = max($fromDate->getTimestamp(), $leave->getStartDate()->getTimestamp());
                $lEnd = min($toDate->getTimestamp(), $leave->getEndDate()->getTimestamp());
                $current = new \DateTime('@' . $lStart);
                $end = new \DateTime('@' . $lEnd);
                while ($current <= $end) {
                    $leaveMap[$emp->getId() . '_' . $current->format('Y-m-d')] = $leave;
                    $current->modify('+1 day');
                }
            }
        }

        $formatTime = static function (?\DateTimeInterface $dt) use ($wsTz): ?string {
            if ($dt === null) {
                return null;
            }

            return \DateTimeImmutable::createFromInterface($dt)->setTimezone($wsTz)->format('H:i');
        };

        $wsTodayStr = DateService::today($wsTz)->format('Y-m-d');
        $perDayRulesActive = $this->planService->canUseShiftTimeRules($workspace);

        $result = [];
        foreach ($employees as $emp) {
            $leftAtStr = $emp->getLeftAt()?->format('Y-m-d');
            $linkedAtStr = $emp->getLinkedAt()?->format('Y-m-d');
            $shift = $emp->getShift();
            $days = [];
            $period = new \DatePeriod($fromDate, new \DateInterval('P1D'), (clone $toDate)->modify('+1 day'));
            foreach ($period as $day) {
                $dateStr = $day->format('Y-m-d');
                $key = $emp->getId() . '_' . $dateStr;

                // Past employee's last working day — omit so they don't show
                // absent/upcoming for dates they weren't employed.
                if ($leftAtStr !== null && $dateStr > $leftAtStr) {
                    continue;
                }

                // Before the employee was linked — omit for the same reason: a
                // mid-month linked employee shouldn't show absent rows for the
                // days before they had an account that could check in.
                if ($linkedAtStr === null || $dateStr < $linkedAtStr) {
                    continue;
                }

                // Off-day: this employee's per-day-ruled shift skips this
                // weekday. Surface it as 'off' on the gantt instead of 'absent'
                // so a Mon-Fri GM doesn't look like a no-show every Saturday.
                // A real check-in below still overrides this to 'present'.
                $dayOfWeek = DayOfWeekEnum::tryFrom((int) $day->format('N'));
                $isOffDay = $perDayRulesActive
                    && $shift !== null
                    && $shift->hasAnyTimeRules()
                    && $dayOfWeek !== null
                    && !$shift->isScheduledOn($dayOfWeek);

                if (isset($closureDates[$dateStr])) {
                    $days[] = ['date' => $dateStr, 'status' => 'closure'];
                    continue;
                }

                if (isset($leaveMap[$key])) {
                    $leave = $leaveMap[$key];
                    $days[] = [
                        'date' => $dateStr,
                        'status' => 'leave',
                        'leaveType' => $leave->getType()->value,
                    ];
                    continue;
                }

                if (isset($attendanceMap[$key])) {
                    $a = $attendanceMap[$key];
                    if ($a->getCheckInAt() !== null && !$a->isVoided()) {
                        $days[] = [
                            'date' => $dateStr,
                            'status' => 'present',
                            'attendancePublicId' => (string) $a->getPublicId(),
                            'checkInAt' => $formatTime($a->getCheckInAt()),
                            'checkOutAt' => $formatTime($a->getCheckOutAt()),
                            'isLate' => $a->isLate(),
                            'leftEarly' => $a->hasLeftEarly(),
                            'editedAt' => $a->getEditedAt()?->format(\DateTimeInterface::ATOM),
                            'editedByEmail' => $a->getEditedByEmail(),
                            'editReason' => $a->getEditReason(),
                            'originalCheckInAt' => $formatTime($a->getOriginalCheckInAt()),
                            'originalCheckOutAt' => $formatTime($a->getOriginalCheckOutAt()),
                        ];
                        continue;
                    }

                    // A voided row is a tombstone — a manager soft-deleted the
                    // scan. Surface it as its own 'voided' status (neutral, not
                    // counted as present/absent — matching dashboard stats which
                    // drop voided rows) so the Monthly grid can show & filter it.
                    if ($a->isVoided()) {
                        $days[] = [
                            'date' => $dateStr,
                            'status' => 'voided',
                            'attendancePublicId' => (string) $a->getPublicId(),
                            'checkInAt' => $formatTime($a->getOriginalCheckInAt() ?? $a->getCheckInAt()),
                            'checkOutAt' => $formatTime($a->getOriginalCheckOutAt() ?? $a->getCheckOutAt()),
                            'voidedByEmail' => $a->getVoidedByEmail(),
                            'voidReason' => $a->getVoidReason(),
                        ];
                        continue;
                    }
                }

                if ($isOffDay) {
                    $days[] = ['date' => $dateStr, 'status' => 'off'];
                    continue;
                }

                // Future dates are not yet absent
                if ($dateStr > $wsTodayStr) {
                    $days[] = ['date' => $dateStr, 'status' => 'upcoming'];
                } else {
                    $days[] = ['date' => $dateStr, 'status' => 'absent'];
                }
            }

            // Omit employees with no days in range (never-linked, or linked
            // after the range / left before it) so the gantt isn't padded with
            // empty rows.
            if (empty($days)) {
                continue;
            }

            $result[] = [
                'employeePublicId' => (string) $emp->getPublicId(),
                'employeeName' => $emp->getName(),
                'shiftName' => $emp->getShift()?->getName(),
                'days' => $days,
            ];
        }

        return $result;
    }
}

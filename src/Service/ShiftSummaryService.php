<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\Workspace;
use App\Enum\DayOfWeekEnum;
use App\Enum\EmployeeStatusEnum;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;

/**
 * Builds the per-shift digest rows the cron consumer fires push + email for.
 *
 * For each shift in a workspace, two digests are emitted per day:
 *   - "start" — fires when shift.start + 30 min is in the scan window. Buckets
 *     the shift's expected roster into onTime / late / missed.
 *   - "end"   — fires when shift.end   + 30 min is in the scan window. Buckets
 *     the same roster into completed / leftEarly / missed.
 *
 * The cron runs every 5 minutes; the "+30 min" mark must fall inside the
 * half-open window `(now − 5 min, now]` so each digest fires exactly once per
 * shift per day (no need for any DB-side dedupe).
 *
 * Pure logic — no persistence, no notification, no plan checks. Time work goes
 * through DateService so tests can freeze "now" via the clock seam.
 */
class ShiftSummaryService
{
    /** How long after the shift edge before we emit the digest. */
    private const int DELAY_MINUTES = 30;

    /** Width of the scan window (the cron interval). */
    private const int SCAN_WINDOW_MINUTES = 5;

    public function __construct(
        private readonly AttendanceRepository    $attendanceRepository,
        private readonly ClosurePeriodRepository $closurePeriodRepository,
        private readonly LeaveRequestRepository  $leaveRequestRepository,
        private readonly PlanService             $planService,
    ) {
    }

    /**
     * @return list<array{
     *     type: 'start'|'end',
     *     shift: Shift,
     *     dueAt: \DateTimeImmutable,
     *     total: int,
     *     onTime?: list<Employee>,
     *     late?: list<Employee>,
     *     completed?: list<Employee>,
     *     leftEarly?: list<Employee>,
     *     missed: list<Employee>,
     * }>
     */
    public function scan(Workspace $workspace, \DateTimeImmutable $nowUtc): array
    {
        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $today = DateService::today($tz);

        // Closure suppresses every shift digest for the day.
        if ($this->closurePeriodRepository->findActiveOnDate($workspace, $today) !== null) {
            return [];
        }

        $windowStart = $nowUtc->modify('-' . self::SCAN_WINDOW_MINUTES . ' minutes');
        $useShiftTimeRules = $this->planService->canUseShiftTimeRules($workspace);

        $summaries = [];

        foreach ($workspace->getShifts() as $shift) {
            $roster = $this->rosterFor($shift, $today);
            if (count($roster) === 0) {
                continue;
            }

            $shiftStart = $this->resolveStartTime($shift, $today, $useShiftTimeRules);
            $shiftEnd = $this->resolveEndTime($shift, $today, $useShiftTimeRules);

            if ($shiftStart !== null) {
                $startDueAt = $this->dueAtUtc($today, $shiftStart, $tz);
                if ($this->withinScanWindow($startDueAt, $windowStart, $nowUtc)) {
                    $summaries[] = $this->buildStartSummary($shift, $roster, $today, $startDueAt);
                }
            }

            if ($shiftEnd !== null) {
                $endDueAt = $this->dueAtUtc($today, $shiftEnd, $tz);
                if ($this->withinScanWindow($endDueAt, $windowStart, $nowUtc)) {
                    $summaries[] = $this->buildEndSummary($shift, $roster, $today, $endDueAt);
                }
            }
        }

        return $summaries;
    }

    /**
     * Active, attendance-tracked employees assigned to the shift who are NOT on
     * approved full-day leave today. These are the people whose check-in/out
     * the owner cares about.
     *
     * @return list<Employee>
     */
    private function rosterFor(Shift $shift, \DateTimeImmutable $today): array
    {
        $roster = [];
        foreach ($shift->getEmployees() as $employee) {
            if (!$this->shouldEvaluate($employee)) {
                continue;
            }

            $approvedLeave = $this->leaveRequestRepository->findApprovedForEmployeeOnDate($employee, $today);
            if ($approvedLeave !== null && $approvedLeave->isFullDay()) {
                continue;
            }

            $roster[] = $employee;
        }
        return $roster;
    }

    /**
     * @param list<Employee> $roster
     * @return array{
     *     type: 'start',
     *     shift: Shift,
     *     dueAt: \DateTimeImmutable,
     *     total: int,
     *     onTime: list<Employee>,
     *     late: list<Employee>,
     *     missed: list<Employee>,
     * }
     */
    private function buildStartSummary(Shift $shift, array $roster, \DateTimeImmutable $today, \DateTimeImmutable $dueAt): array
    {
        $onTime = [];
        $late = [];
        $missed = [];

        foreach ($roster as $employee) {
            $attendance = $this->attendanceRepository->findByEmployeeAndDate($employee, $today);
            // Voided rows are tombstones; for digest purposes the day didn't
            // happen, so the employee falls into the missed bucket.
            if ($attendance === null
                || $attendance->isVoided()
                || $attendance->getCheckInAt() === null
            ) {
                $missed[] = $employee;
                continue;
            }
            if ($attendance->isLate()) {
                $late[] = $employee;
                continue;
            }
            $onTime[] = $employee;
        }

        return [
            'type' => 'start',
            'shift' => $shift,
            'dueAt' => $dueAt,
            'total' => count($roster),
            'onTime' => $onTime,
            'late' => $late,
            'missed' => $missed,
        ];
    }

    /**
     * @param list<Employee> $roster
     * @return array{
     *     type: 'end',
     *     shift: Shift,
     *     dueAt: \DateTimeImmutable,
     *     total: int,
     *     completed: list<Employee>,
     *     leftEarly: list<Employee>,
     *     missed: list<Employee>,
     * }
     */
    private function buildEndSummary(Shift $shift, array $roster, \DateTimeImmutable $today, \DateTimeImmutable $dueAt): array
    {
        $completed = [];
        $leftEarly = [];
        $missed = [];

        foreach ($roster as $employee) {
            $attendance = $this->attendanceRepository->findByEmployeeAndDate($employee, $today);
            // Voided rows: see buildStartSummary — treat as missed.
            if ($attendance === null
                || $attendance->isVoided()
                || $attendance->getCheckInAt() === null
            ) {
                $missed[] = $employee;
                continue;
            }
            if ($attendance->hasLeftEarly()) {
                $leftEarly[] = $employee;
                continue;
            }
            if ($attendance->getCheckOutAt() !== null) {
                $completed[] = $employee;
            }
            // checkInAt set, no checkOutAt, not leftEarly → still working. Not counted
            // in any bucket — they'll show up in the next day's start summary if
            // they forgot to scan out (and the existing missing-checkout flow can
            // catch that separately).
        }

        return [
            'type' => 'end',
            'shift' => $shift,
            'dueAt' => $dueAt,
            'total' => count($roster),
            'completed' => $completed,
            'leftEarly' => $leftEarly,
            'missed' => $missed,
        ];
    }

    private function shouldEvaluate(Employee $employee): bool
    {
        if ($employee->getDeletedAt() !== null) {
            return false;
        }
        if ($employee->getStatus() !== EmployeeStatusEnum::ACTIVE) {
            return false;
        }
        if (!$employee->isAttendanceTracked()) {
            return false;
        }
        return true;
    }

    /**
     * The "+30 min after the shift edge" instant the scan window slides against.
     *
     * Half-open window: `(windowStart, nowUtc]`. The lower edge is exclusive so
     * a `dueAt` that landed in the previous scan is never re-reported.
     */
    private function withinScanWindow(\DateTimeImmutable $dueAt, \DateTimeImmutable $windowStart, \DateTimeImmutable $nowUtc): bool
    {
        return $dueAt > $windowStart && $dueAt <= $nowUtc;
    }

    private function dueAtUtc(\DateTimeImmutable $today, \DateTimeInterface $shiftTime, \DateTimeZone $tz): \DateTimeImmutable
    {
        $hour = (int) $shiftTime->format('G');
        $minute = (int) $shiftTime->format('i');

        $local = $today->setTimezone($tz)->setTime($hour, $minute);
        return $local->modify('+' . self::DELAY_MINUTES . ' minutes')->setTimezone(DateService::utc());
    }

    private function resolveStartTime(Shift $shift, \DateTimeImmutable $today, bool $useTimeRules): ?\DateTimeInterface
    {
        if ($useTimeRules) {
            $rule = $this->findRuleForDay($shift, $today);
            if ($rule !== null) {
                return DateService::createFromFormat('H:i', $rule->getStartTime());
            }
        }
        return $shift->getStartTime();
    }

    private function resolveEndTime(Shift $shift, \DateTimeImmutable $today, bool $useTimeRules): ?\DateTimeInterface
    {
        if ($useTimeRules) {
            $rule = $this->findRuleForDay($shift, $today);
            if ($rule !== null) {
                return DateService::createFromFormat('H:i', $rule->getEndTime());
            }
        }
        return $shift->getEndTime();
    }

    private function findRuleForDay(Shift $shift, \DateTimeImmutable $today): ?\App\Entity\ShiftTimeRule
    {
        $dayOfWeek = DayOfWeekEnum::tryFrom((int) $today->format('N'));
        if ($dayOfWeek === null) {
            return null;
        }
        foreach ($shift->getTimeRules() as $rule) {
            if ($rule->getDayOfWeek() === $dayOfWeek) {
                return $rule;
            }
        }
        return null;
    }
}

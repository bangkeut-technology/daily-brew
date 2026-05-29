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
 * Detects per-shift attendance anomalies the cron consumer can alert on:
 *   - missing_checkin  → shift started ≥ 1 h ago and the employee has no Attendance row today
 *   - missing_checkout → shift ended ≥ 1 h ago and today's Attendance has no checkOutAt
 *
 * The cron runs every 5 minutes; the "1 h after" mark must fall inside the
 * `[now − 5 min, now]` window so each anomaly fires exactly once per day.
 *
 * Pure logic — no persistence, no notification, no plan checks. Time work goes
 * through DateService so tests can freeze "now" via the clock seam.
 */
class ShiftAnomalyService
{
    /** How long after the shift edge before we treat it as an anomaly. */
    private const int OVERDUE_MINUTES = 60;

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
     *     type: 'missing_checkin'|'missing_checkout',
     *     employee: Employee,
     *     shift: Shift,
     *     expectedAt: \DateTimeImmutable,
     *     attendance?: Attendance,
     * }>
     */
    public function scan(Workspace $workspace, \DateTimeImmutable $nowUtc): array
    {
        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $today = DateService::today($tz);

        // Closure suppresses every expectation for the day.
        if ($this->closurePeriodRepository->findActiveOnDate($workspace, $today) !== null) {
            return [];
        }

        $windowStart = $nowUtc->modify('-' . self::SCAN_WINDOW_MINUTES . ' minutes');
        $useShiftTimeRules = $this->planService->canUseShiftTimeRules($workspace);

        $anomalies = [];
        foreach ($workspace->getEmployees() as $employee) {
            if (!$this->shouldEvaluate($employee)) {
                continue;
            }

            $shift = $employee->getShift();
            if ($shift === null) {
                continue;
            }

            // Approved full-day leave silences both alerts for the day.
            $approvedLeave = $this->leaveRequestRepository->findApprovedForEmployeeOnDate($employee, $today);
            if ($approvedLeave !== null && $approvedLeave->isFullDay()) {
                continue;
            }

            $attendance = $this->attendanceRepository->findByEmployeeAndDate($employee, $today);

            // Missing check-in — no row at all and shift start + 1 h is in the window.
            if ($attendance === null) {
                $shiftStart = $this->resolveStartTime($shift, $today, $useShiftTimeRules);
                if ($shiftStart !== null) {
                    $dueAt = $this->dueAtUtc($today, $shiftStart, $tz);
                    if ($this->withinScanWindow($dueAt, $windowStart, $nowUtc)) {
                        $anomalies[] = [
                            'type' => 'missing_checkin',
                            'employee' => $employee,
                            'shift' => $shift,
                            'expectedAt' => $dueAt,
                        ];
                    }
                }
                continue;
            }

            // Missing check-out — has check-in, no check-out, shift end + 1 h is in the window.
            if ($attendance->getCheckInAt() !== null && $attendance->getCheckOutAt() === null) {
                $shiftEnd = $this->resolveEndTime($shift, $today, $useShiftTimeRules);
                if ($shiftEnd !== null) {
                    $dueAt = $this->dueAtUtc($today, $shiftEnd, $tz);
                    if ($this->withinScanWindow($dueAt, $windowStart, $nowUtc)) {
                        $anomalies[] = [
                            'type' => 'missing_checkout',
                            'employee' => $employee,
                            'shift' => $shift,
                            'expectedAt' => $dueAt,
                            'attendance' => $attendance,
                        ];
                    }
                }
            }
        }

        return $anomalies;
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
     * The "1 h after the shift edge" instant the scan window slides against.
     *
     * The window is half-open: `(windowStart, nowUtc]`. The lower edge is
     * exclusive so a `dueAt` that landed in the previous scan is never
     * re-reported (prevents 5-minute duplicates).
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
        return $local->modify('+' . self::OVERDUE_MINUTES . ' minutes')->setTimezone(DateService::utc());
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

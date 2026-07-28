<?php

declare(strict_types=1);

namespace App\Service\Dashboard;

use App\Entity\Employee;
use App\Entity\Workspace;
use App\Service\Attendance\AttendanceSummaryBuilder;
use App\Service\DateService;

/**
 * Rolls the per-employee/per-day attendance grid up into the shapes the
 * dashboard charts consume: a daily stacked series, punctuality by weekday, and
 * a lateness leaderboard.
 *
 * Deliberately built on top of {@see AttendanceSummaryBuilder} rather than its
 * own queries — the gantt already encodes every rule that decides whether a day
 * is present / absent / leave / off / closed (per-day shift rules, closures,
 * leave, void tombstones, join & leave dates). Re-deriving that here would let
 * the charts drift from the grid owners cross-check them against.
 *
 * The window is built at double length so the previous period of equal length
 * comes out of the same pass and the UI can render "vs previous N days" deltas
 * without a second round-trip.
 */
final readonly class DashboardTrendService
{
    /** Longest window the charts offer. Guards the O(employees x days) build. */
    public const int MAX_DAYS = 30;

    public function __construct(
        private AttendanceSummaryBuilder $summaryBuilder,
    ) {}

    /**
     * @param list<Employee> $employees employees in scope (owner/manager: all; otherwise self)
     *
     * @return array<string, mixed>
     */
    public function build(Workspace $workspace, array $employees, int $days): array
    {
        $days = max(1, min(self::MAX_DAYS, $days));
        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

        $to = DateService::today($tz);
        $from = $to->modify(sprintf('-%d days', $days - 1));
        // Same length again, immediately before the current window.
        $previousFrom = $from->modify(sprintf('-%d days', $days));

        $grid = $this->summaryBuilder->build($workspace, $previousFrom, $to, $employees);

        $fromStr = $from->format('Y-m-d');
        $current = new PeriodTally();
        $previous = new PeriodTally();

        foreach ($grid as $row) {
            $employeeKey = $row['employeePublicId'];
            $employeeName = $row['employeeName'];
            foreach ($row['days'] as $day) {
                $tally = $day['date'] >= $fromStr ? $current : $previous;
                $tally->add($day, $employeeKey, $employeeName);
            }
        }

        return [
            'from' => $fromStr,
            'to' => $to->format('Y-m-d'),
            'days' => $days,
            'daily' => $current->daily($from, $to),
            'byWeekday' => $current->byWeekday(),
            'topLate' => $current->topLate(),
            'totals' => $current->totals() + [
                'previousAttendanceRate' => $previous->attendanceRate(),
                'previousOnTimeRate' => $previous->onTimeRate(),
            ],
        ];
    }
}

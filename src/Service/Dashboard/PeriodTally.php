<?php

declare(strict_types=1);

namespace App\Service\Dashboard;

use App\Service\DateService;

/**
 * Mutable accumulator for one period's worth of attendance-grid cells. It
 * exists only so {@see DashboardTrendService}'s current and previous windows
 * share the exact same counting rules instead of two near-identical loops.
 *
 * @internal
 */
final class PeriodTally
{
    /** @var array<string, array{onTime: int, late: int, leave: int, absent: int, closure: int}> date => counts */
    private array $byDate = [];

    /** @var array<string, array{name: string, onTime: int, late: int, absent: int}> employeePublicId => counts */
    private array $byEmployee = [];

    private int $onTime = 0;
    private int $late = 0;
    private int $leave = 0;
    private int $absent = 0;

    /**
     * @param array<string, mixed> $day one cell from the summary grid
     */
    public function add(array $day, string $employeeKey, string $employeeName): void
    {
        $date = $day['date'];
        $this->byDate[$date] ??= ['onTime' => 0, 'late' => 0, 'leave' => 0, 'absent' => 0, 'closure' => 0];
        $this->byEmployee[$employeeKey] ??= ['name' => $employeeName, 'onTime' => 0, 'late' => 0, 'absent' => 0];

        switch ($day['status']) {
            case 'present':
                // `isLate` is the flag the grid already computed against the
                // employee's shift + grace window — never recomputed here.
                $bucket = ($day['isLate'] ?? false) ? 'late' : 'onTime';
                ++$this->byDate[$date][$bucket];
                ++$this->byEmployee[$employeeKey][$bucket];
                $bucket === 'late' ? ++$this->late : ++$this->onTime;
                break;
            case 'leave':
                ++$this->byDate[$date]['leave'];
                ++$this->leave;
                break;
            case 'absent':
                ++$this->byDate[$date]['absent'];
                ++$this->byEmployee[$employeeKey]['absent'];
                ++$this->absent;
                break;
            case 'closure':
                ++$this->byDate[$date]['closure'];
                break;
            // 'off' (shift not scheduled), 'upcoming' and 'voided' are neither
            // an expectation nor a miss — they stay out of every denominator.
        }
    }

    /**
     * One entry per calendar day in the window, including days nobody was
     * expected, so the column chart keeps an even time axis instead of
     * collapsing gaps.
     *
     * @return list<array<string, mixed>>
     */
    public function daily(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $out = [];
        $period = new \DatePeriod($from, new \DateInterval('P1D'), $to->modify('+1 day'));
        foreach ($period as $day) {
            $date = $day->format('Y-m-d');
            $counts = $this->byDate[$date] ?? ['onTime' => 0, 'late' => 0, 'leave' => 0, 'absent' => 0, 'closure' => 0];
            $present = $counts['onTime'] + $counts['late'];
            $out[] = [
                'date' => $date,
                'dayOfWeek' => (int) $day->format('N'),
                'onTime' => $counts['onTime'],
                'late' => $counts['late'],
                'leave' => $counts['leave'],
                'absent' => $counts['absent'],
                // A day is "closed" only when the closure swallowed it whole —
                // a partial closure with real check-ins still plots normally.
                'closed' => $counts['closure'] > 0 && $present + $counts['leave'] + $counts['absent'] === 0,
                'expected' => $present + $counts['absent'],
                'attendanceRate' => self::rate($present, $present + $counts['absent']),
                'onTimeRate' => self::rate($counts['onTime'], $present),
            ];
        }

        return $out;
    }

    /**
     * Punctuality by day of the week — answers "is Monday morning our problem?".
     * Monday-first (ISO), and only days that carried an expectation contribute.
     *
     * @return list<array<string, mixed>>
     */
    public function byWeekday(): array
    {
        $buckets = [];
        for ($dow = 1; $dow <= 7; ++$dow) {
            $buckets[$dow] = ['onTime' => 0, 'late' => 0, 'absent' => 0];
        }

        foreach ($this->byDate as $date => $counts) {
            $dow = (int) DateService::parse($date)->format('N');
            $buckets[$dow]['onTime'] += $counts['onTime'];
            $buckets[$dow]['late'] += $counts['late'];
            $buckets[$dow]['absent'] += $counts['absent'];
        }

        $out = [];
        foreach ($buckets as $dow => $counts) {
            $present = $counts['onTime'] + $counts['late'];
            $out[] = [
                'dayOfWeek' => $dow,
                'onTime' => $counts['onTime'],
                'late' => $counts['late'],
                'absent' => $counts['absent'],
                'present' => $present,
                'onTimeRate' => self::rate($counts['onTime'], $present),
                'hasData' => $present + $counts['absent'] > 0,
            ];
        }

        return $out;
    }

    /**
     * Employees with the most late arrivals, worst first. Ties break on the
     * higher late rate so a 3-of-4 beats a 3-of-20.
     *
     * @return list<array<string, mixed>>
     */
    public function topLate(int $limit = 5): array
    {
        $rows = [];
        foreach ($this->byEmployee as $publicId => $counts) {
            if ($counts['late'] === 0) {
                continue;
            }
            $present = $counts['onTime'] + $counts['late'];
            $rows[] = [
                'employeePublicId' => $publicId,
                'employeeName' => $counts['name'],
                'late' => $counts['late'],
                'present' => $present,
                'absent' => $counts['absent'],
                'lateRate' => self::rate($counts['late'], $present),
            ];
        }

        usort($rows, static fn (array $a, array $b) => [$b['late'], $b['lateRate']] <=> [$a['late'], $a['lateRate']]);

        return array_slice($rows, 0, $limit);
    }

    /** @return array<string, int> */
    public function totals(): array
    {
        return [
            'onTime' => $this->onTime,
            'late' => $this->late,
            'leave' => $this->leave,
            'absent' => $this->absent,
            'present' => $this->onTime + $this->late,
            'expected' => $this->onTime + $this->late + $this->absent,
            'attendanceRate' => $this->attendanceRate(),
            'onTimeRate' => $this->onTimeRate(),
        ];
    }

    /** Share of expected days that were actually worked. Leave is not a miss, so it is out of the denominator. */
    public function attendanceRate(): int
    {
        $present = $this->onTime + $this->late;

        return self::rate($present, $present + $this->absent);
    }

    public function onTimeRate(): int
    {
        return self::rate($this->onTime, $this->onTime + $this->late);
    }

    private static function rate(int $part, int $whole): int
    {
        return $whole > 0 ? (int) round($part / $whole * 100) : 0;
    }
}

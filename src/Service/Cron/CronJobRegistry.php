<?php

declare(strict_types=1);

namespace App\Service\Cron;

/**
 * Allowlist of console commands that may be scheduled or run through the
 * admin cron console at /admin/cron.
 *
 * Two roles:
 *   1. Authoritative validator for the /admin/cron/schedules API — any
 *      payload referencing a command not present here is rejected.
 *   2. Source for the React command-picker dropdown.
 *
 * The dukecity bundle's `included_command_namespaces` config narrows the
 * universe to `app:*` and `dailybrew:*`; this registry narrows further
 * to the specific commands we have decided are safe to schedule from
 * the UI (some commands — e.g. dailybrew:admin:promote-user — should
 * remain CLI-only and are intentionally NOT listed here).
 *
 * Adding a new schedulable command: append to JOBS and ship.
 */
final class CronJobRegistry
{
    /**
     * @var array<string, array{label: string, description: string, suggestedCron: string}>
     */
    public const JOBS = [
        'dailybrew:send-daily-summary' => [
            'label' => 'Daily summary — owner push + email',
            'description' => 'Sends the end-of-day attendance summary to Espresso+ workspace owners. Run hourly; the command sends to each workspace exactly once when its local clock reaches the --hour value (default 18:00).',
            'suggestedCron' => '0 * * * *',
        ],
        'dailybrew:scan-shift-anomalies' => [
            'label' => 'Shift anomalies — missing check-in/out alerts',
            'description' => 'Every 5 minutes, scans Espresso+ workspaces and fires push + email to the owner and managers (manage_attendance) when a tracked employee is an hour past their shift start with no check-in, or past their shift end with no check-out.',
            'suggestedCron' => '*/5 * * * *',
        ],
    ];

    public static function isAllowed(string $command): bool
    {
        return array_key_exists($command, self::JOBS);
    }

    /**
     * @return array<int, array{command: string, label: string, description: string, suggestedCron: string}>
     */
    public static function options(): array
    {
        $out = [];
        foreach (self::JOBS as $command => $meta) {
            $out[] = [
                'command' => $command,
                'label' => $meta['label'],
                'description' => $meta['description'],
                'suggestedCron' => $meta['suggestedCron'],
            ];
        }
        return $out;
    }
}

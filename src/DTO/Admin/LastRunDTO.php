<?php

declare(strict_types=1);

namespace App\DTO\Admin;

use App\Entity\AdminCronRun;

/**
 * Wire shape for an entry in daily_brew_admin_cron_runs — surfaced both
 * embedded on ScheduledCommandDTO.lastRun and as elements of
 * GET /admin/cron/runs.
 */
final class LastRunDTO
{
    public function __construct(
        public string $publicId,
        public string $command,
        public string $startedAt,
        public ?string $finishedAt,
        public string $status,
        public ?int $exitCode,
        public ?string $outputTail,
        public ?string $triggeredByEmail,
    ) {
    }

    public static function fromEntity(AdminCronRun $run): self
    {
        return new self(
            publicId: $run->getPublicId(),
            command: $run->getCommand(),
            startedAt: $run->getStartedAt()?->format(DATE_ATOM) ?? '',
            finishedAt: $run->getFinishedAt()?->format(DATE_ATOM),
            status: $run->getStatus(),
            exitCode: $run->getExitCode(),
            outputTail: $run->getOutputTail(),
            triggeredByEmail: $run->getTriggeredBy()?->getEmail(),
        );
    }
}

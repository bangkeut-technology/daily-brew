<?php

declare(strict_types=1);

namespace App\DTO\Admin;

use App\Entity\AdminCronRun;
use Dukecity\CommandSchedulerBundle\Entity\ScheduledCommandInterface;
use Exception;

/**
 * Wire shape for /admin/cron/schedules — flattens the bundle's
 * ScheduledCommand entity plus the latest audit row from
 * daily_brew_admin_cron_runs into one payload for the React list view.
 */
final class ScheduledCommandDTO
{
    public function __construct(
        public int $id,
        public string $name,
        public string $command,
        public ?string $arguments,
        public string $cronExpression,
        public string $cronExpressionTranslated,
        public bool $disabled,
        public bool $locked,
        public bool $executeImmediately,
        public int $priority,
        public ?string $lastExecution,
        public ?int $lastReturnCode,
        public ?string $nextRunDate,
        public ?LastRunDTO $lastRun,
    ) {
    }

    public static function fromEntities(ScheduledCommandInterface $command, ?AdminCronRun $lastRun): self
    {
        try {
            $nextRunDate = $command->getNextRunDate()?->format(DATE_ATOM);
        } catch (Exception) {
            $nextRunDate = null;
        }

        return new self(
            id: (int) $command->getId(),
            name: $command->getName() ?? '',
            command: $command->getCommand() ?? '',
            arguments: $command->getArguments(),
            cronExpression: $command->getCronExpression() ?? '',
            cronExpressionTranslated: $command->getCronExpressionTranslated(),
            disabled: (bool) $command->getDisabled(),
            locked: (bool) $command->getLocked(),
            executeImmediately: $command->getExecuteImmediately(),
            priority: $command->getPriority(),
            lastExecution: $command->getLastExecution()?->format(DATE_ATOM),
            lastReturnCode: $command->getLastReturnCode(),
            nextRunDate: $nextRunDate,
            lastRun: $lastRun !== null ? LastRunDTO::fromEntity($lastRun) : null,
        );
    }
}

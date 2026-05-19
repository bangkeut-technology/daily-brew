<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\AdminCronRunRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Append-only audit log of console-command executions for any command in
 * App\Service\Cron\CronJobRegistry. Populated by CronRunSubscriber on the
 * Console events — so a single row exists per invocation regardless of
 * whether the trigger was the dukecity scheduler:execute master cron, a
 * manual SSH session, or the /admin/cron/schedules/{id}/run endpoint.
 *
 * The bundle's own ScheduledCommand entity stores only "last execution +
 * last return code" — this table is the history surface the Run History
 * drawer on the React admin page reads from.
 *
 * Entries are never updated or deleted from app code.
 */
#[ORM\Table(name: 'daily_brew_admin_cron_runs')]
#[ORM\Index(name: 'idx_cron_run_command_started', columns: ['command', 'started_at'])]
#[ORM\Entity(repositoryClass: AdminCronRunRepository::class)]
class AdminCronRun extends AbstractBaseEntity
{
    public const STATUS_RUNNING = 'running';
    public const STATUS_SUCCESS = 'success';
    public const STATUS_FAILED = 'failed';

    #[ORM\Column(length: 200)]
    private string $command = '';

    #[ORM\Column(name: 'started_at', type: Types::DATETIME_IMMUTABLE)]
    private ?DateTimeImmutable $startedAt = null;

    #[ORM\Column(name: 'finished_at', type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $finishedAt = null;

    #[ORM\Column(length: 16)]
    private string $status = self::STATUS_RUNNING;

    #[ORM\Column(name: 'exit_code', type: Types::SMALLINT, nullable: true)]
    private ?int $exitCode = null;

    /** Last ~4KB of combined stdout/stderr — enough to surface a stack trace. */
    #[ORM\Column(name: 'output_tail', type: Types::TEXT, nullable: true)]
    private ?string $outputTail = null;

    /** Null when the run was triggered by system cron / SSH rather than a super-admin. */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'triggered_by_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?User $triggeredBy = null;

    public function getCommand(): string
    {
        return $this->command;
    }

    public function setCommand(string $command): self
    {
        $this->command = $command;
        return $this;
    }

    public function getStartedAt(): ?DateTimeImmutable
    {
        return $this->startedAt;
    }

    public function setStartedAt(DateTimeImmutable $startedAt): self
    {
        $this->startedAt = $startedAt;
        return $this;
    }

    public function getFinishedAt(): ?DateTimeImmutable
    {
        return $this->finishedAt;
    }

    public function setFinishedAt(?DateTimeImmutable $finishedAt): self
    {
        $this->finishedAt = $finishedAt;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;
        return $this;
    }

    public function getExitCode(): ?int
    {
        return $this->exitCode;
    }

    public function setExitCode(?int $exitCode): self
    {
        $this->exitCode = $exitCode;
        return $this;
    }

    public function getOutputTail(): ?string
    {
        return $this->outputTail;
    }

    public function setOutputTail(?string $outputTail): self
    {
        $this->outputTail = $outputTail;
        return $this;
    }

    public function getTriggeredBy(): ?User
    {
        return $this->triggeredBy;
    }

    public function setTriggeredBy(?User $triggeredBy): self
    {
        $this->triggeredBy = $triggeredBy;
        return $this;
    }
}

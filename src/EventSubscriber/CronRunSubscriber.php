<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use App\Entity\AdminCronRun;
use App\Repository\AdminCronRunRepository;
use App\Service\Cron\CronJobRegistry;
use DateTimeImmutable;
use Symfony\Component\Console\ConsoleEvents;
use Symfony\Component\Console\Event\ConsoleCommandEvent;
use Symfony\Component\Console\Event\ConsoleTerminateEvent;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Records one AdminCronRun row per execution of any command listed in
 * CronJobRegistry::JOBS. Hooks ConsoleEvents::COMMAND (insert "running")
 * and ConsoleEvents::TERMINATE (set status + exit code + tail of captured
 * output, if a BufferedOutput was supplied by the caller).
 *
 * Works transparently for three execution paths:
 *   - `scheduler:execute` (bundle's master cron) — invokes child console
 *     processes that re-enter this subscriber.
 *   - Direct CLI invocation (developer SSH, ad-hoc).
 *   - The /admin/cron/schedules/{id}/run endpoint — see the controller
 *     for the in-process invocation that yields a BufferedOutput.
 *
 * Manual "triggeredBy" attribution is handled by the controller itself
 * (after the run completes it updates the most recent row); this listener
 * doesn't have access to the security token in CLI mode.
 */
final class CronRunSubscriber implements EventSubscriberInterface
{
    private const OUTPUT_TAIL_BYTES = 4096;

    /** @var array<string, int> command name → run id, for the current process */
    private array $activeRuns = [];

    public function __construct(
        private readonly AdminCronRunRepository $runRepository,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            ConsoleEvents::COMMAND => ['onCommand', 0],
            ConsoleEvents::TERMINATE => ['onTerminate', 0],
        ];
    }

    public function onCommand(ConsoleCommandEvent $event): void
    {
        $name = $event->getCommand()?->getName();
        if ($name === null || !CronJobRegistry::isAllowed($name)) {
            return;
        }

        $run = new AdminCronRun();
        $run->setCommand($name)
            ->setStartedAt(new DateTimeImmutable())
            ->setStatus(AdminCronRun::STATUS_RUNNING);

        $this->runRepository->persist($run);
        $this->runRepository->flush();
        $this->activeRuns[$name] = (int) $run->getId();
    }

    public function onTerminate(ConsoleTerminateEvent $event): void
    {
        $name = $event->getCommand()?->getName();
        if ($name === null || !isset($this->activeRuns[$name])) {
            return;
        }

        $runId = $this->activeRuns[$name];
        unset($this->activeRuns[$name]);

        $run = $this->runRepository->find($runId);
        if ($run === null) {
            return;
        }

        $exitCode = $event->getExitCode();
        $run->setFinishedAt(new DateTimeImmutable())
            ->setExitCode($exitCode)
            ->setStatus($exitCode === 0 ? AdminCronRun::STATUS_SUCCESS : AdminCronRun::STATUS_FAILED);

        $output = $event->getOutput();
        if ($output instanceof BufferedOutput) {
            $tail = $output->fetch();
            if (strlen($tail) > self::OUTPUT_TAIL_BYTES) {
                $tail = '…' . substr($tail, -self::OUTPUT_TAIL_BYTES);
            }
            $run->setOutputTail($tail);
        }

        $this->runRepository->flush();
    }
}

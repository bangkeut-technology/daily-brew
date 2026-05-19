<?php

declare(strict_types=1);

namespace App\ApiController\Admin;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\Admin\LastRunDTO;
use App\DTO\Admin\ScheduledCommandDTO;
use App\Repository\AdminCronRunRepository;
use App\Service\Cron\CronJobRegistry;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Dukecity\CommandSchedulerBundle\Entity\ScheduledCommand;
use Symfony\Bundle\FrameworkBundle\Console\Application as ConsoleApplication;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\StringInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\Attribute\Route;
use Throwable;

/**
 * Surfaces the dukecity ScheduledCommand store through the React admin
 * console. The bundle's own Twig admin panel is intentionally not exposed.
 *
 * Endpoints:
 *   GET    /admin/cron/jobs                  — registry options (command picker)
 *   GET    /admin/cron/schedules             — list with last-run badge
 *   POST   /admin/cron/schedules             — create
 *   PATCH  /admin/cron/schedules/{id}        — edit / enable / disable
 *   DELETE /admin/cron/schedules/{id}
 *   POST   /admin/cron/schedules/{id}/run    — trigger immediate run
 *   GET    /admin/cron/runs                  — audit history
 *
 * Defence in depth: every write path validates the command against
 * CronJobRegistry — the bundle's `included_command_namespaces` already
 * narrows to app:* / dailybrew:*, but the registry narrows further to
 * the specific commands that are safe to schedule from the UI.
 */
#[Route('/admin/cron')]
class AdminCronController extends AbstractController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly AdminCronRunRepository $runRepository,
        private readonly KernelInterface $kernel,
    ) {
    }

    #[Route('/jobs', name: 'admin_cron_jobs', methods: ['GET'])]
    public function jobs(): JsonResponse
    {
        return $this->jsonSuccess(CronJobRegistry::options());
    }

    #[Route('/schedules', name: 'admin_cron_schedules_list', methods: ['GET'])]
    public function listSchedules(): JsonResponse
    {
        $schedules = $this->em->getRepository(ScheduledCommand::class)->findBy(
            [],
            ['disabled' => 'ASC', 'priority' => 'DESC'],
        );

        $commands = array_map(static fn (ScheduledCommand $s): string => $s->getCommand() ?? '', $schedules);
        $lastRuns = $this->runRepository->findLastRunByCommand(array_filter($commands));

        $out = array_map(
            fn (ScheduledCommand $s) => ScheduledCommandDTO::fromEntities(
                $s,
                $lastRuns[$s->getCommand() ?? ''] ?? null,
            ),
            $schedules,
        );

        return $this->jsonSuccess($out);
    }

    #[Route('/schedules', name: 'admin_cron_schedules_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $payload = $request->getPayload();
        $command = (string) ($payload->get('command') ?? '');
        $name = trim((string) ($payload->get('name') ?? ''));
        $cron = trim((string) ($payload->get('cronExpression') ?? ''));

        if (!CronJobRegistry::isAllowed($command)) {
            return $this->jsonError('Command is not in the allowlist', 400);
        }
        if ($name === '') {
            return $this->jsonError('Name is required', 400);
        }
        if ($cron === '') {
            return $this->jsonError('Cron expression is required', 400);
        }

        $schedule = new ScheduledCommand();
        $schedule->setName($name)
            ->setCommand($command)
            ->setCronExpression($cron)
            ->setArguments((string) ($payload->get('arguments') ?? ''))
            ->setPriority((int) ($payload->get('priority') ?? 0))
            ->setDisabled((bool) ($payload->get('disabled') ?? false));

        $this->em->persist($schedule);
        $this->em->flush();

        return $this->jsonSuccess(
            ScheduledCommandDTO::fromEntities($schedule, null),
            Response::HTTP_CREATED,
        );
    }

    #[Route('/schedules/{id}', name: 'admin_cron_schedules_update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $schedule = $this->em->getRepository(ScheduledCommand::class)->find($id);
        if ($schedule === null) {
            return $this->jsonError('Schedule not found', 404);
        }

        $payload = $request->getPayload();

        if ($payload->has('command')) {
            $command = (string) $payload->get('command');
            if (!CronJobRegistry::isAllowed($command)) {
                return $this->jsonError('Command is not in the allowlist', 400);
            }
            $schedule->setCommand($command);
        }
        if ($payload->has('name')) {
            $schedule->setName(trim((string) $payload->get('name')));
        }
        if ($payload->has('cronExpression')) {
            $schedule->setCronExpression(trim((string) $payload->get('cronExpression')));
        }
        if ($payload->has('arguments')) {
            $schedule->setArguments((string) $payload->get('arguments'));
        }
        if ($payload->has('priority')) {
            $schedule->setPriority((int) $payload->get('priority'));
        }
        if ($payload->has('disabled')) {
            $schedule->setDisabled((bool) $payload->get('disabled'));
        }

        $this->em->flush();

        $lastRun = $this->runRepository->findLastRunByCommand([$schedule->getCommand() ?? ''])[$schedule->getCommand() ?? ''] ?? null;
        return $this->jsonSuccess(ScheduledCommandDTO::fromEntities($schedule, $lastRun));
    }

    #[Route('/schedules/{id}', name: 'admin_cron_schedules_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $schedule = $this->em->getRepository(ScheduledCommand::class)->find($id);
        if ($schedule === null) {
            return $this->jsonError('Schedule not found', 404);
        }
        $this->em->remove($schedule);
        $this->em->flush();
        return $this->jsonSuccess(['deleted' => true]);
    }

    /**
     * Run the scheduled command now. We run it in-process via the
     * Symfony console Application so it picks up our CronRunSubscriber
     * (which records the AdminCronRun row + captures output tail).
     *
     * For long-running commands a future enhancement is to dispatch a
     * Messenger job instead; the listener will still record correctly
     * because the worker process re-enters ConsoleEvents.
     */
    #[Route('/schedules/{id}/run', name: 'admin_cron_schedules_run', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function run(int $id): JsonResponse
    {
        $schedule = $this->em->getRepository(ScheduledCommand::class)->find($id);
        if ($schedule === null) {
            return $this->jsonError('Schedule not found', 404);
        }

        $command = $schedule->getCommand() ?? '';
        if (!CronJobRegistry::isAllowed($command)) {
            return $this->jsonError('Command is not in the allowlist', 400);
        }

        $output = new BufferedOutput();
        $application = new ConsoleApplication($this->kernel);
        $application->setAutoExit(false);

        $args = trim((string) $schedule->getArguments());
        $input = $args !== ''
            ? new StringInput($command . ' ' . $args)
            : new ArrayInput(['command' => $command]);

        try {
            $exitCode = $application->run($input, $output);
        } catch (Throwable $e) {
            return $this->jsonError('Command execution failed: ' . $e->getMessage(), 500);
        }

        // CronRunSubscriber already inserted the audit row. Attribute it to
        // the user that triggered the run.
        $lastRun = $this->runRepository->findLastRunByCommand([$command])[$command] ?? null;
        if ($lastRun !== null && $this->getUser() !== null) {
            $lastRun->setTriggeredBy($this->getUser());
            $this->em->flush();
        }

        return $this->jsonSuccess([
            'exitCode' => $exitCode,
            'startedAt' => $lastRun?->getStartedAt()?->format(DATE_ATOM),
            'finishedAt' => $lastRun?->getFinishedAt()?->format(DATE_ATOM) ?? (new DateTimeImmutable())->format(DATE_ATOM),
            'outputTail' => $lastRun?->getOutputTail() ?? $output->fetch(),
        ]);
    }

    #[Route('/runs', name: 'admin_cron_runs', methods: ['GET'])]
    public function runs(Request $request): JsonResponse
    {
        $command = (string) $request->query->get('command', '');
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));

        if ($command === '') {
            return $this->jsonError('command query parameter is required', 400);
        }

        $rows = $this->runRepository->findRecentByCommand($command, $limit);
        return $this->jsonSuccess(array_map(LastRunDTO::fromEntity(...), $rows));
    }
}

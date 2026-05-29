<?php

declare(strict_types=1);

namespace App\Command;

use App\Repository\WorkspaceRepository;
use App\Service\DateService;
use App\Service\NotificationService;
use App\Service\PlanService;
use App\Service\ShiftSummaryService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'dailybrew:scan-shift-summaries',
    description: 'Scan Espresso+ workspaces every 5 min and emit a digest at each shift start+30 min and end+30 min',
)]
class ScanShiftSummariesCommand extends Command
{
    public function __construct(
        private readonly WorkspaceRepository  $workspaceRepository,
        private readonly PlanService          $planService,
        private readonly ShiftSummaryService  $shiftSummaryService,
        private readonly NotificationService  $notificationService,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $nowUtc = DateService::now();

        $startSent = 0;
        $endSent = 0;
        $workspacesProcessed = 0;

        foreach ($this->workspaceRepository->findAll() as $workspace) {
            if ($workspace->getDeletedAt() !== null) {
                continue;
            }
            if (!$this->planService->isAtLeastEspresso($workspace)) {
                continue;
            }

            $workspacesProcessed++;
            $summaries = $this->shiftSummaryService->scan($workspace, $nowUtc);

            foreach ($summaries as $summary) {
                $this->notificationService->notifyShiftSummary($workspace, $summary);
                if ($summary['type'] === 'start') {
                    $startSent++;
                } elseif ($summary['type'] === 'end') {
                    $endSent++;
                }
            }
        }

        $io->success(sprintf(
            'Sent %d start summaries and %d end summaries across %d workspaces',
            $startSent,
            $endSent,
            $workspacesProcessed,
        ));

        return Command::SUCCESS;
    }
}

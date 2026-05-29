<?php

declare(strict_types=1);

namespace App\Command;

use App\Repository\WorkspaceRepository;
use App\Service\DateService;
use App\Service\NotificationService;
use App\Service\PlanService;
use App\Service\ShiftAnomalyService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'dailybrew:scan-shift-anomalies',
    description: 'Scan Espresso+ workspaces every 5 minutes for missed check-ins and check-outs',
)]
class ScanShiftAnomaliesCommand extends Command
{
    public function __construct(
        private readonly WorkspaceRepository $workspaceRepository,
        private readonly PlanService         $planService,
        private readonly ShiftAnomalyService $shiftAnomalyService,
        private readonly NotificationService $notificationService,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $nowUtc = DateService::now();

        $missingCheckins = 0;
        $missingCheckouts = 0;
        $workspacesProcessed = 0;

        foreach ($this->workspaceRepository->findAll() as $workspace) {
            if ($workspace->getDeletedAt() !== null) {
                continue;
            }
            if (!$this->planService->isAtLeastEspresso($workspace)) {
                continue;
            }

            $workspacesProcessed++;
            $anomalies = $this->shiftAnomalyService->scan($workspace, $nowUtc);

            foreach ($anomalies as $anomaly) {
                if ($anomaly['type'] === 'missing_checkin') {
                    $this->notificationService->notifyMissingCheckin(
                        $anomaly['employee'],
                        $anomaly['shift'],
                        $anomaly['expectedAt'],
                    );
                    $missingCheckins++;
                } elseif ($anomaly['type'] === 'missing_checkout' && isset($anomaly['attendance'])) {
                    $this->notificationService->notifyMissingCheckout(
                        $anomaly['attendance'],
                        $anomaly['shift'],
                        $anomaly['expectedAt'],
                    );
                    $missingCheckouts++;
                }
            }
        }

        $io->success(sprintf(
            'Sent %d check-in alerts and %d check-out alerts across %d workspaces',
            $missingCheckins,
            $missingCheckouts,
            $workspacesProcessed,
        ));

        return Command::SUCCESS;
    }
}

<?php

declare(strict_types=1);

namespace App\Command;

use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Repository\WorkspaceRepository;
use App\Service\DateService;
use App\Service\NotificationService;
use App\Service\PlanService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'dailybrew:send-daily-summary',
    description: 'Send daily attendance summary to Espresso+ workspace owners whose local hour matches --hour (run hourly)',
)]
class SendDailySummaryCommand extends Command
{
    public function __construct(
        private readonly WorkspaceRepository    $workspaceRepository,
        private readonly EmployeeRepository     $employeeRepository,
        private readonly AttendanceRepository   $attendanceRepository,
        private readonly LeaveRequestRepository $leaveRequestRepository,
        private readonly PlanService            $planService,
        private readonly NotificationService    $notificationService,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption(
            'hour',
            null,
            InputOption::VALUE_REQUIRED,
            'Workspace-local hour (0–23) the digest is targeted at. The cron runs hourly and each workspace receives it once at this hour in its own timezone.',
            '18',
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $targetHour = (int) $input->getOption('hour');
        if ($targetHour < 0 || $targetHour > 23) {
            $io->error('--hour must be between 0 and 23');
            return Command::INVALID;
        }

        $workspaces = $this->workspaceRepository->findAll();
        $sent = 0;

        foreach ($workspaces as $workspace) {
            if ($workspace->getDeletedAt() !== null) {
                continue;
            }
            if (!$this->planService->isAtLeastEspresso($workspace)) {
                continue;
            }

            $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

            // Per-workspace local-hour gate — the cron runs every hour and only
            // the workspaces whose current local hour == --hour receive a digest.
            $localHour = (int) DateService::now()->setTimezone($tz)->format('G');
            if ($localHour !== $targetHour) {
                continue;
            }

            $today = DateService::today($tz);

            $totalEmployees = $this->employeeRepository->countActiveByWorkspace($workspace);
            if ($totalEmployees === 0) {
                continue;
            }

            $attendances = $this->attendanceRepository->findByWorkspaceAndDate($workspace, $today);
            $presentCount = count($attendances);
            $lateCount = 0;
            foreach ($attendances as $attendance) {
                if ($attendance->isLate()) {
                    $lateCount++;
                }
            }

            $onLeaveCount = $this->leaveRequestRepository->countApprovedByWorkspaceAndDate($workspace, $today);

            $this->notificationService->notifyDailySummary(
                $workspace,
                $totalEmployees,
                $presentCount,
                $lateCount,
                $onLeaveCount,
            );

            $sent++;
        }

        $io->success(sprintf('Daily summary sent to %d workspace(s)', $sent));

        return Command::SUCCESS;
    }
}

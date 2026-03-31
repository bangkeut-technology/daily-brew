<?php

declare(strict_types=1);

namespace App\Command;

use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Repository\WorkspaceRepository;
use App\Service\NotificationService;
use App\Service\PlanService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:send-daily-summary',
    description: 'Send daily attendance summary notifications to Espresso workspace owners',
)]
class SendDailySummaryCommand extends Command
{
    public function __construct(
        private WorkspaceRepository $workspaceRepository,
        private EmployeeRepository $employeeRepository,
        private AttendanceRepository $attendanceRepository,
        private LeaveRequestRepository $leaveRequestRepository,
        private PlanService $planService,
        private NotificationService $notificationService,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $workspaces = $this->workspaceRepository->findAll();
        $sent = 0;

        foreach ($workspaces as $workspace) {
            if (!$this->planService->isAtLeastEspresso($workspace)) {
                continue;
            }

            $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
            $today = new \DateTimeImmutable('today', $tz);

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

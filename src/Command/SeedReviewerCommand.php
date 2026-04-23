<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Attendance;
use App\Entity\ClosurePeriod;
use App\Entity\LeaveRequest;
use App\Enum\EmployeeRoleEnum;
use App\Enum\LeaveRequestStatusEnum;
use App\Enum\LeaveTypeEnum;
use App\Enum\PlanEnum;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Service\AuthService;
use App\Service\DateService;
use App\Service\EmployeeService;
use App\Service\ShiftService;
use App\Service\WorkspaceService;
use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'dailybrew:seed-reviewer',
    description: 'Seed a test account for App Store / Google Play reviewers',
)]
class SeedReviewerCommand extends Command
{
    private const OWNER_EMAIL = 'reviewer@dailybrew.work';
    private const OWNER_PASSWORD = 'DailyBrew2026!';
    private const MANAGER_EMAIL = 'manager@dailybrew.work';
    private const MANAGER_PASSWORD = 'DailyBrew2026!';
    private const EMPLOYEE_EMAIL = 'employee@dailybrew.work';
    private const EMPLOYEE_PASSWORD = 'DailyBrew2026!';
    private const WORKSPACE_NAME = 'The Daily Grind';

    public function __construct(
        private Connection $connection,
        private UserRepository $userRepository,
        private WorkspaceRepository $workspaceRepository,
        private SubscriptionRepository $subscriptionRepository,
        private AttendanceRepository $attendanceRepository,
        private ClosurePeriodRepository $closurePeriodRepository,
        private LeaveRequestRepository $leaveRequestRepository,
        private AuthService $authService,
        private WorkspaceService $workspaceService,
        private ShiftService $shiftService,
        private EmployeeService $employeeService,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('fresh', null, InputOption::VALUE_NONE, 'Delete existing reviewer data and re-seed');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $fresh = $input->getOption('fresh');

        $io->text(sprintf('PHP default timezone: %s', date_default_timezone_get()));

        // Ensure UTC to match web server — prevents TZ mismatch between CLI and FPM
        if (date_default_timezone_get() !== 'UTC') {
            $io->warning(sprintf(
                'PHP CLI timezone is "%s" (expected UTC). Forcing UTC for this command.',
                date_default_timezone_get(),
            ));
            date_default_timezone_set('UTC');
        }

        $existing = $this->userRepository->findByEmail(self::OWNER_EMAIL);

        if ($existing !== null) {
            if (!$fresh) {
                $io->warning('Reviewer account already exists. Run with --fresh to re-seed.');

                return Command::SUCCESS;
            }

            $this->purgeReviewerData($existing, $io);
        }

        // ── Owner account ────────────────────────────────────────
        $owner = $this->authService->register(
            self::OWNER_EMAIL,
            self::OWNER_PASSWORD,
            'John',
            'Doe',
        );
        $owner->setOnboardingCompleted(true);
        $this->userRepository->flush();
        $io->text('Created owner: ' . self::OWNER_EMAIL);

        // ── Workspace ────────────────────────────────────────────
        $workspace = $this->workspaceService->create($owner, self::WORKSPACE_NAME, 'Asia/Phnom_Penh');
        $io->text('Created workspace: ' . self::WORKSPACE_NAME);

        // ── Upgrade to Espresso ──────────────────────────────────
        $subscription = $this->subscriptionRepository->findByWorkspace($workspace);
        $subscription->setPlan(PlanEnum::Espresso);
        $subscription->setCurrentPeriodEnd(DateService::mutableRelative('+1 year'));
        $this->subscriptionRepository->flush();
        $io->text('Upgraded to Espresso plan');

        // ── Shifts ───────────────────────────────────────────────
        // Shift times are conceptual (Doctrine `time` type) — no timezone needed.
        // Matches how the API creates them: \DateTime::createFromFormat('H:i', '07:00')
        $morningShift = $this->shiftService->create(
            $workspace,
            'Morning',
            DateService::mutableParse('07:00'),
            DateService::mutableParse('15:00'),
        );

        $eveningShift = $this->shiftService->create(
            $workspace,
            'Evening',
            DateService::mutableParse('15:00'),
            DateService::mutableParse('23:00'),
        );
        $io->text('Created shifts: Morning (07:00–15:00), Evening (15:00–23:00)');

        // ── Employees ────────────────────────────────────────────
        $employees = [
            ['Sophea', 'Chan', '012345001', $morningShift],
            ['Dara', 'Sok', '012345002', $morningShift],
            ['Sreyleak', 'Heng', '012345003', $morningShift],
            ['Visal', 'Phan', '012345004', $eveningShift],
            ['Chantrea', 'Lim', '012345005', $eveningShift],
        ];

        $employeeEntities = [];
        foreach ($employees as [$firstName, $lastName, $phone, $shift]) {
            $employeeEntities[] = $this->employeeService->create(
                $workspace,
                $firstName,
                $lastName,
                $phone,
                $shift,
            );
        }
        $io->text(sprintf('Created %d employees', count($employeeEntities)));

        // ── Manager account (linked to Sophea Chan) ──────────────
        $managerUser = $this->authService->register(
            self::MANAGER_EMAIL,
            self::MANAGER_PASSWORD,
            'Sophea',
            'Chan',
        );
        $managerUser->setOnboardingCompleted(true);
        $managerUser->setCurrentWorkspace($workspace);
        $this->employeeService->linkUser($employeeEntities[0], $managerUser);
        $employeeEntities[0]->setRole(EmployeeRoleEnum::MANAGER);
        $this->userRepository->flush();
        $io->text('Created manager: ' . self::MANAGER_EMAIL . ' (Sophea Chan)');

        // ── Employee account (linked to Dara Sok) ────────────────
        $employeeUser = $this->authService->register(
            self::EMPLOYEE_EMAIL,
            self::EMPLOYEE_PASSWORD,
            'Dara',
            'Sok',
        );
        $employeeUser->setOnboardingCompleted(true);
        $employeeUser->setCurrentWorkspace($workspace);
        $this->employeeService->linkUser($employeeEntities[1], $employeeUser);
        $this->userRepository->flush();
        $io->text('Created employee: ' . self::EMPLOYEE_EMAIL . ' (Dara Sok)');

        // ── Closure period ───────────────────────────────────────
        $closure = new ClosurePeriod();
        $closure->setWorkspace($workspace);
        $closure->setName('Khmer New Year');
        $closure->setNameCanonical('khmer new year');
        $closure->setStartDate(DateService::mutableRelative('+30 days'));
        $closure->setEndDate(DateService::mutableRelative('+33 days'));
        $this->closurePeriodRepository->update($closure, false);
        $io->text('Created closure: Khmer New Year');

        // ── Attendance records (last 7 days) ─────────────────────
        // CheckinService stores checkInAt/checkOutAt in UTC ($nowUtc).
        // Doctrine datetime_immutable has no TZ info — values are read back as server-default (UTC).
        // AttendanceDTO then converts UTC → workspace TZ for display.
        // So seeder must also store in UTC: build time in workspace TZ, then ->setTimezone(UTC).
        $attendanceCount = 0;
        $tz = new \DateTimeZone('Asia/Phnom_Penh');
        $utc = new \DateTimeZone('UTC');

        for ($d = 6; $d >= 0; $d--) {
            $date = new \DateTimeImmutable("-{$d} days", $tz);
            $dayOfWeek = (int) $date->format('N'); // 1=Mon … 7=Sun

            // Skip weekends
            if ($dayOfWeek >= 6) {
                continue;
            }

            foreach ($employeeEntities as $i => $employee) {
                $shift = $employee->getShift();
                if ($shift === null) {
                    continue;
                }

                $shiftStart = $shift->getStartTime();
                $shiftEnd = $shift->getEndTime();
                if ($shiftStart === null || $shiftEnd === null) {
                    continue;
                }

                // Simulate some variation: occasional late arrival
                $lateMinutes = ($d === 3 && $i === 0) ? 12 : (($d === 1 && $i === 2) ? 8 : 0);

                // Build check-in time in workspace TZ, then convert to UTC for storage
                $checkInTime = \DateTimeImmutable::createFromFormat(
                    'Y-m-d H:i',
                    $date->format('Y-m-d') . ' ' . $shiftStart->format('H:i'),
                    $tz,
                );
                if ($lateMinutes > 0) {
                    $checkInTime = $checkInTime->modify("+{$lateMinutes} minutes");
                }
                $checkInTime = $checkInTime->setTimezone($utc);

                // Simulate occasional early departure
                $earlyMinutes = ($d === 2 && $i === 4) ? 15 : 0;

                $checkOutTime = \DateTimeImmutable::createFromFormat(
                    'Y-m-d H:i',
                    $date->format('Y-m-d') . ' ' . $shiftEnd->format('H:i'),
                    $tz,
                );
                if ($earlyMinutes > 0) {
                    $checkOutTime = $checkOutTime->modify("-{$earlyMinutes} minutes");
                }
                $checkOutTime = $checkOutTime->setTimezone($utc);

                // Skip one employee on one day to show "absent"
                if ($d === 4 && $i === 3) {
                    continue;
                }

                $attendance = new Attendance();
                $attendance->setEmployee($employee);
                $attendance->setWorkspace($workspace);
                $attendance->setDate($date);
                $attendance->setCheckInAt($checkInTime);
                $attendance->setCheckOutAt($checkOutTime);
                $attendance->setIsLate($lateMinutes > 0);
                $attendance->setLeftEarly($earlyMinutes > 0);
                $attendance->setIpAddress('127.0.0.1');

                $this->attendanceRepository->update($attendance, false);
                $attendanceCount++;
            }
        }
        $io->text(sprintf('Created %d attendance records', $attendanceCount));

        // ── Leave requests ───────────────────────────────────────
        // Approved leave (past)
        $leave1 = new LeaveRequest();
        $leave1->setEmployee($employeeEntities[1]);
        $leave1->setWorkspace($workspace);
        $leave1->setRequestedBy($owner);
        $leave1->setStartDate(DateService::relative('-14 days'));
        $leave1->setEndDate(DateService::relative('-13 days'));
        $leave1->setReason('Family event');
        $leave1->setType(LeaveTypeEnum::PAID);
        $leave1->setStatus(LeaveRequestStatusEnum::APPROVED);
        $leave1->setReviewedBy($owner);
        $leave1->setReviewedAt(DateService::relative('-15 days'));
        $this->leaveRequestRepository->update($leave1, false);

        // Pending leave (upcoming)
        $leave2 = new LeaveRequest();
        $leave2->setEmployee($employeeEntities[2]);
        $leave2->setWorkspace($workspace);
        $leave2->setRequestedBy($owner);
        $leave2->setStartDate(DateService::relative('+3 days'));
        $leave2->setEndDate(DateService::relative('+4 days'));
        $leave2->setReason('Medical appointment');
        $leave2->setType(LeaveTypeEnum::PAID);
        $leave2->setStatus(LeaveRequestStatusEnum::PENDING);
        $this->leaveRequestRepository->update($leave2, false);

        // Rejected leave
        $leave3 = new LeaveRequest();
        $leave3->setEmployee($employeeEntities[4]);
        $leave3->setWorkspace($workspace);
        $leave3->setRequestedBy($owner);
        $leave3->setStartDate(DateService::relative('+1 day'));
        $leave3->setEndDate(DateService::relative('+1 day'));
        $leave3->setReason('Personal day');
        $leave3->setType(LeaveTypeEnum::UNPAID);
        $leave3->setStatus(LeaveRequestStatusEnum::REJECTED);
        $leave3->setReviewedBy($owner);
        $leave3->setReviewedAt(DateService::relative('-1 day'));
        $leave3->setReviewNote('Short staffed this week');
        $this->leaveRequestRepository->update($leave3, false);

        $io->text('Created 3 leave requests (approved, pending, rejected)');

        // ── Flush remaining entities ─────────────────────────────
        $this->userRepository->flush();

        $io->newLine();
        $io->success('Reviewer accounts seeded successfully');
        $io->table(
            ['Role', 'Email', 'Password'],
            [
                ['Owner', self::OWNER_EMAIL, self::OWNER_PASSWORD],
                ['Manager', self::MANAGER_EMAIL, self::MANAGER_PASSWORD],
                ['Employee', self::EMPLOYEE_EMAIL, self::EMPLOYEE_PASSWORD],
            ],
        );
        $io->table(
            ['Field', 'Value'],
            [
                ['Workspace', self::WORKSPACE_NAME],
                ['Plan', 'Espresso'],
                ['Employees', (string) count($employeeEntities)],
                ['Manager', 'Sophea Chan (' . self::MANAGER_EMAIL . ')'],
                ['Employee', 'Dara Sok (' . self::EMPLOYEE_EMAIL . ')'],
                ['Shifts', '2 (Morning, Evening)'],
                ['Attendance', $attendanceCount . ' records (last 7 weekdays)'],
                ['Leave requests', '3 (approved, pending, rejected)'],
                ['Closure', 'Khmer New Year (upcoming)'],
            ],
        );

        return Command::SUCCESS;
    }

    private function purgeReviewerData(\App\Entity\User $user, SymfonyStyle $io): void
    {
        $io->text('Purging existing reviewer data...');

        $conn = $this->connection;
        $userId = $user->getId();

        // Clear currentWorkspace FK on the user first
        $conn->executeStatement('UPDATE daily_brew_users SET current_workspace_id = NULL WHERE id = ?', [$userId]);

        // Find all workspaces owned by this user
        $wsIds = $conn->fetchFirstColumn('SELECT id FROM daily_brew_workspaces WHERE owner_id = ?', [$userId]);

        foreach ($wsIds as $wsId) {
            $conn->executeStatement('DELETE FROM daily_brew_leave_requests WHERE workspace_id = ?', [$wsId]);
            $conn->executeStatement('DELETE FROM daily_brew_attendances WHERE workspace_id = ?', [$wsId]);
            $conn->executeStatement('DELETE FROM daily_brew_closure_periods WHERE workspace_id = ?', [$wsId]);
            $conn->executeStatement(
                'DELETE FROM daily_brew_shift_time_rules WHERE shift_id IN (SELECT id FROM daily_brew_shifts WHERE workspace_id = ?)',
                [$wsId],
            );
            $conn->executeStatement('DELETE FROM daily_brew_shifts WHERE workspace_id = ?', [$wsId]);
            $conn->executeStatement('DELETE FROM daily_brew_employees WHERE workspace_id = ?', [$wsId]);
            $conn->executeStatement('DELETE FROM daily_brew_subscriptions WHERE workspace_id = ?', [$wsId]);
            $conn->executeStatement('DELETE FROM daily_brew_workspace_settings WHERE workspace_id = ?', [$wsId]);
            $conn->executeStatement('DELETE FROM daily_brew_workspaces WHERE id = ?', [$wsId]);
        }

        $this->safeDelete($conn, 'DELETE FROM daily_brew_device_tokens WHERE user_id = ?', [$userId]);
        $this->safeDelete($conn, 'DELETE FROM daily_brew_refresh_tokens WHERE username = ?', [self::OWNER_EMAIL]);
        $this->safeDelete($conn, 'DELETE FROM daily_brew_refresh_tokens WHERE username = ?', [self::MANAGER_EMAIL]);
        $this->safeDelete($conn, 'DELETE FROM daily_brew_refresh_tokens WHERE username = ?', [self::EMPLOYEE_EMAIL]);
        $conn->executeStatement('DELETE FROM daily_brew_users WHERE id = ?', [$userId]);

        // Delete manager and employee user accounts
        $conn->executeStatement('UPDATE daily_brew_users SET current_workspace_id = NULL WHERE email_canonical IN (?, ?)', [self::MANAGER_EMAIL, self::EMPLOYEE_EMAIL]);
        $conn->executeStatement('DELETE FROM daily_brew_users WHERE email_canonical IN (?, ?)', [self::MANAGER_EMAIL, self::EMPLOYEE_EMAIL]);

        $this->userRepository->clear();

        $io->text('Purged existing reviewer data');
    }

    private function safeDelete(\Doctrine\DBAL\Connection $conn, string $sql, array $params): void
    {
        try {
            $conn->executeStatement($sql, $params);
        } catch (\Doctrine\DBAL\Exception\TableNotFoundException) {
            // Table not yet migrated — skip
        }
    }
}

<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Attendance;
use App\Entity\ClosurePeriod;
use App\Entity\LeaveRequest;
use App\Enum\LeaveRequestStatusEnum;
use App\Enum\LeaveTypeEnum;
use App\Repository\UserRepository;
use App\Service\AuthService;
use App\Service\EmployeeService;
use App\Service\ShiftService;
use App\Service\WorkspaceService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
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
    private const WORKSPACE_NAME = 'The Daily Grind';

    public function __construct(
        private EntityManagerInterface $em,
        private UserRepository $userRepository,
        private AuthService $authService,
        private WorkspaceService $workspaceService,
        private ShiftService $shiftService,
        private EmployeeService $employeeService,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Abort if the reviewer account already exists
        $existing = $this->userRepository->findByEmail(self::OWNER_EMAIL);
        if ($existing !== null) {
            $io->warning('Reviewer account already exists (' . self::OWNER_EMAIL . '). Skipping.');

            return Command::SUCCESS;
        }

        // ── Owner account ────────────────────────────────────────
        $owner = $this->authService->register(
            self::OWNER_EMAIL,
            self::OWNER_PASSWORD,
            'John',
            'Doe',
        );
        $io->text('Created owner: ' . self::OWNER_EMAIL);

        // ── Workspace ────────────────────────────────────────────
        $workspace = $this->workspaceService->create($owner, self::WORKSPACE_NAME);
        $io->text('Created workspace: ' . self::WORKSPACE_NAME);

        // ── Shifts ───────────────────────────────────────────────
        $morningShift = $this->shiftService->create(
            $workspace,
            'Morning',
            new \DateTime('07:00'),
            new \DateTime('15:00'),
        );

        $eveningShift = $this->shiftService->create(
            $workspace,
            'Evening',
            new \DateTime('15:00'),
            new \DateTime('23:00'),
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

        // ── Closure period ───────────────────────────────────────
        $closure = new ClosurePeriod();
        $closure->setWorkspace($workspace);
        $closure->setName('Khmer New Year');
        $closure->setNameCanonical('khmer new year');
        $closure->setStartDate(new \DateTimeImmutable('+30 days'));
        $closure->setEndDate(new \DateTimeImmutable('+33 days'));
        $this->em->persist($closure);
        $io->text('Created closure: Khmer New Year');

        // ── Attendance records (last 7 days) ─────────────────────
        $attendanceCount = 0;
        $tz = new \DateTimeZone('Asia/Phnom_Penh');

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

                $checkInTime = \DateTimeImmutable::createFromFormat(
                    'Y-m-d H:i',
                    $date->format('Y-m-d') . ' ' . $shiftStart->format('H:i'),
                    $tz,
                );
                if ($lateMinutes > 0) {
                    $checkInTime = $checkInTime->modify("+{$lateMinutes} minutes");
                }

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

                $this->em->persist($attendance);
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
        $leave1->setStartDate(new \DateTimeImmutable('-14 days'));
        $leave1->setEndDate(new \DateTimeImmutable('-13 days'));
        $leave1->setReason('Family event');
        $leave1->setType(LeaveTypeEnum::PAID);
        $leave1->setStatus(LeaveRequestStatusEnum::APPROVED);
        $leave1->setReviewedBy($owner);
        $leave1->setReviewedAt(new \DateTimeImmutable('-15 days'));
        $this->em->persist($leave1);

        // Pending leave (upcoming)
        $leave2 = new LeaveRequest();
        $leave2->setEmployee($employeeEntities[2]);
        $leave2->setWorkspace($workspace);
        $leave2->setRequestedBy($owner);
        $leave2->setStartDate(new \DateTimeImmutable('+3 days'));
        $leave2->setEndDate(new \DateTimeImmutable('+4 days'));
        $leave2->setReason('Medical appointment');
        $leave2->setType(LeaveTypeEnum::PAID);
        $leave2->setStatus(LeaveRequestStatusEnum::PENDING);
        $this->em->persist($leave2);

        // Rejected leave
        $leave3 = new LeaveRequest();
        $leave3->setEmployee($employeeEntities[4]);
        $leave3->setWorkspace($workspace);
        $leave3->setRequestedBy($owner);
        $leave3->setStartDate(new \DateTimeImmutable('+1 day'));
        $leave3->setEndDate(new \DateTimeImmutable('+1 day'));
        $leave3->setReason('Personal day');
        $leave3->setType(LeaveTypeEnum::UNPAID);
        $leave3->setStatus(LeaveRequestStatusEnum::REJECTED);
        $leave3->setReviewedBy($owner);
        $leave3->setReviewedAt(new \DateTimeImmutable('-1 day'));
        $leave3->setReviewNote('Short staffed this week');
        $this->em->persist($leave3);

        $io->text('Created 3 leave requests (approved, pending, rejected)');

        // ── Flush remaining entities ─────────────────────────────
        $this->em->flush();

        $io->newLine();
        $io->success('Reviewer account seeded successfully');
        $io->table(
            ['Field', 'Value'],
            [
                ['Email', self::OWNER_EMAIL],
                ['Password', self::OWNER_PASSWORD],
                ['Workspace', self::WORKSPACE_NAME],
                ['Employees', (string) count($employeeEntities)],
                ['Shifts', '2 (Morning, Evening)'],
                ['Attendance', $attendanceCount . ' records (last 7 weekdays)'],
                ['Leave requests', '3 (approved, pending, rejected)'],
                ['Closure', 'Khmer New Year (upcoming)'],
            ],
        );

        return Command::SUCCESS;
    }
}

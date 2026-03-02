<?php
/**
 * This file is part of the DailyBrew project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 1/7/26 10:03AM
 *
 * @see     https://dailybrew.work
 */

namespace App\Command;

use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceUser;
use App\Enum\PlanEnum;
use App\Enum\WorkspaceRoleEnum;
use App\Repository\AttendanceBatchRepository;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeEvaluationRepository;
use App\Repository\EmployeeRepository;
use App\Repository\EvaluationCriteriaRepository;
use App\Repository\EvaluationTemplateCriteriaRepository;
use App\Repository\EvaluationTemplateRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceUserRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use function assert;

/**
 *
 * Class WorkspaceBootstrapCommand
 *
 * @package App\Command;
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[AsCommand(
    name: 'daily-brew:workspace:bootstrap',
    description: 'One-time: create a default workspace for users who do not own one, and optionally set it as current workspace.'
)]
final class WorkspaceBootstrapCommand extends Command
{
    public function __construct(
        private readonly UserRepository                       $userRepository,
        private readonly WorkspaceRepository                  $workspaceRepository,
        private readonly WorkspaceUserRepository              $workspaceUserRepository,
        private readonly EmployeeRepository                   $employeeRepository,
        private readonly AttendanceBatchRepository            $attendanceBatchRepository,
        private readonly AttendanceRepository                 $attendanceRepository,
        private readonly EvaluationCriteriaRepository         $evaluationCriteriaRepository,
        private readonly EvaluationTemplateCriteriaRepository $evaluationTemplateCriteriaRepository,
        private readonly EvaluationTemplateRepository         $evaluationTemplateRepository,
        private readonly EmployeeEvaluationRepository         $employeeEvaluationRepository,
    )
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Do not write to database')
            ->addOption('batch-size', null, InputOption::VALUE_REQUIRED, 'Flush batch size', '200')
            ->addOption('plan', null, InputOption::VALUE_REQUIRED, 'Plan for created workspaces (e.g. FREE)', PlanEnum::FREE->name);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $dryRun = (bool)$input->getOption('dry-run');
        $batchSize = max(30, (int)$input->getOption('batch-size'));

        $planName = strtoupper(trim((string)$input->getOption('plan')));
        $plan = PlanEnum::tryFrom($planName) ?? PlanEnum::FREE;

        $io->note(sprintf(
            'Mode: %s | plan: %s | batch-size: %d',
            $dryRun ? 'DRY-RUN' : 'WRITE',
            $plan->name,
            $batchSize
        ));

        $users = $this->userRepository->createQueryBuilder('u')
            ->leftJoin('u.workspaces', 'wu')
            ->andWhere('wu.id IS NULL')
            ->orderBy('u.id', 'ASC')
            ->getQuery()
            ->getResult();

        $created = 0;
        $processed = 0;

        foreach ($users as $user) {
            assert($user instanceof User);

            if ($user->getCurrentWorkspace() instanceof Workspace) {
                continue;
            }

            $workspace = new Workspace();
            $workspace->setName($this->defaultWorkspaceName($user));
            $workspace->setPlan($plan);

            $workspaceUser = new WorkspaceUser()
                ->setUser($user)
                ->setWorkspace($workspace)
                ->setRole(WorkspaceRoleEnum::OWNER);

            $workspace->addUser($workspaceUser);
            $user->addWorkspace($workspaceUser);

            $user->setCurrentWorkspace($workspace);

            $this->workspaceRepository->update($workspace, false);
            $this->workspaceUserRepository->update($workspaceUser, false);

            $employees = $this->employeeRepository->findByUserWithoutWorkspace($user);
            foreach ($employees as $index => $employee) {
                $employee->setWorkspace($workspace);
                $this->employeeRepository->update($employee, false);
                if ($index % $batchSize === 0) {
                    $this->employeeRepository->flush();
                }
            }

            $employeeEvaluations = $this->employeeEvaluationRepository->findByUserWithoutWorkspace($user);
            foreach ($employeeEvaluations as $index => $employeeEvaluation) {
                $employeeEvaluation->setWorkspace($workspace);
                $this->employeeEvaluationRepository->update($employeeEvaluation, false);
                if ($index % $batchSize === 0) {
                    $this->employeeEvaluationRepository->flush();
                }
            }

            $attendanceBatches = $this->attendanceBatchRepository->findByUserWithoutWorkspace($user);
            foreach ($attendanceBatches as $index => $attendanceBatch) {
                $attendanceBatch->setWorkspace($workspace);
                $this->attendanceBatchRepository->update($attendanceBatch, false);
                if ($index % $batchSize === 0) {
                    $this->attendanceBatchRepository->flush();
                }
            }

            $attendances = $this->attendanceRepository->findByUserWithoutWorkspace($user);
            foreach ($attendances as $index => $attendance) {
                $attendance->setWorkspace($workspace);
                $this->attendanceRepository->update($attendance, false);
                if ($index % $batchSize === 0) {
                    $this->attendanceRepository->flush();
                }
            }

            $evaluationCriterias = $this->evaluationCriteriaRepository->findByUserWithoutWorkspace($user);
            foreach ($evaluationCriterias as $index => $evaluationCriteria) {
                $evaluationCriteria->setWorkspace($workspace);
                $this->evaluationCriteriaRepository->update($evaluationCriteria, false);
                if ($index % $batchSize === 0) {
                    $this->evaluationCriteriaRepository->flush();
                }
            }

            $evaluationTemplates = $this->evaluationTemplateRepository->findByUserWithoutWorkspace($user);
            foreach ($evaluationTemplates as $index => $evaluationTemplate) {
                $evaluationTemplate->setWorkspace($workspace);
                $this->evaluationTemplateRepository->update($evaluationTemplate, false);
                if ($index % $batchSize === 0) {
                    $this->evaluationTemplateRepository->flush();
                }
            }

            $evaluationTemplateCriterias = $this->evaluationTemplateCriteriaRepository->findByUserWithoutWorkspace($user);
            foreach ($evaluationTemplateCriterias as $index => $evaluationTemplateCriteria) {
                $evaluationTemplateCriteria->setWorkspace($workspace);
                $this->evaluationTemplateCriteriaRepository->update($evaluationTemplateCriteria, false);
                if ($index % $batchSize === 0) {
                    $this->evaluationTemplateCriteriaRepository->flush();
                }
            }

            $created++;
            $processed++;

            if (!$dryRun && $processed % $batchSize === 0) {
                $this->workspaceRepository->flush();
            }
        }

        if ($dryRun) {
            $io->success(sprintf('Dry-run complete. Workspaces that would be created: %d', $created));
            return Command::SUCCESS;
        }

        $this->workspaceRepository->flush();

        $io->success(sprintf('Bootstrap complete. Workspaces created: %d', $created));
        $io->warning('This command is intended for one-time launch usage. Remove it after running.');

        return Command::SUCCESS;
    }

    private function defaultWorkspaceName(User $user): string
    {
        $fullName = trim($user->getFullName());
        if ($fullName !== '') {
            return sprintf("%s's Workspace", $fullName);
        }

        $email = $user->getEmail() ?? '';
        $prefix = ($email !== '' && str_contains($email, '@')) ? (string)strstr($email, '@', true) : 'User';

        return sprintf("%s's Workspace", $prefix ?: 'User');
    }
}

<?php

declare(strict_types=1);

namespace App\Command;

use App\Repository\DemoSessionRepository;
use App\Repository\EmployeeRepository;
use App\Repository\EvaluationCriteriaRepository;
use App\Repository\EvaluationTemplateRepository;
use DateTimeImmutable;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Class CleanUpDemoDataCommand
 *
 * @package App\Command
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[AsCommand(name: 'dailybrew:demo:clean_up', description: 'Cleans up expired demo data and associated demo users.')]
class DemoCleanUpCommand extends Command
{
    public function __construct(
        private readonly DemoSessionRepository $demoSessionRepository,
        private readonly EvaluationCriteriaRepository $evaluationCriteriaRepository,
        private readonly EvaluationTemplateRepository $templateRepository,
        private readonly EmployeeRepository $employeeRepository,
    )
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $now = new DateTimeImmutable();
        $output->writeln('Cleaning up expired demo data and associated demo users...');
        $demoSessions = $this->demoSessionRepository->findActiveByExpirationDate($now);
        foreach ($demoSessions as $index => $demoSession) {
            $demoSession->setActive(false);

            $criterias = $this->evaluationCriteriaRepository->deleteByUser($demoSession->getUser());
            $output->writeln(sprintf('Deleted %d evaluation criteria for user %s', $criterias, $demoSession->getUser()->getUserIdentifier()));

            $templates = $this->templateRepository->deleteByUser($demoSession->getUser());
            $output->writeln(sprintf('Deleted %d templates for user %s', $templates, $demoSession->getUser()->getUserIdentifier()));

            $employees = $this->employeeRepository->deleteByUser($demoSession->getUser());
            $output->writeln(sprintf('Deleted %d employees for user %s', $employees, $demoSession->getUser()->getUserIdentifier()));

            $this->demoSessionRepository->update($demoSession, false);

            if ($index % 20 === 0) {
                $output->writeln('No employees found for user, skipping deletion.');
            }
        }

        $this->demoSessionRepository->flush();

        $output->writeln('Done!');
        return Command::SUCCESS;
    }
}

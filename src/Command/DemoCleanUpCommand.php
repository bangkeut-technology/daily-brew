<?php

declare(strict_types=1);

namespace App\Command;

use App\Repository\DemoSessionRepository;
use App\Service\DemoSessionCleanUpService;
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
        private readonly DemoSessionRepository     $demoSessionRepository,
        private readonly DemoSessionCleanUpService $demoSessionCleanUpService,
    )
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $now = new DateTimeImmutable();

        $output->writeln('<info>Cleaning up expired demo data and associated demo users...</info>');

        $demoSessions = $this->demoSessionRepository->findActiveByExpirationDate($now);
        foreach ($demoSessions as $index => $demoSession) {
            $output->writeln(sprintf('<info>Cleaning up demo session for user %s</info>', $demoSession->getUser()->getUserIdentifier()));

            $tot = $this->demoSessionCleanUpService->cleanUp($demoSession, $now);

            $output->writeln(sprintf('<info>Deleted %d evaluation criteria</info>', $tot['criteria']));
            $output->writeln(sprintf('<info>Deleted %d evaluation templates</info>', $tot['templates']));
            $output->writeln(sprintf('<info>Deleted %d employees</info>', $tot['employees']));
            $output->writeln(sprintf('<info>Deleted %d attendances</info>', $tot['attendances']));
            $output->writeln(sprintf('<info>Deleted %d batches</info>', $tot['batches']));
            $output->writeln(sprintf('<info>Deleted %d roles</info>', $tot['roles']));
            $output->writeln('');
            $output->writeln(sprintf('<info>Setting demo session for demo session: %s</info>', $demoSession->getUser()->getUserIdentifier()));

            $demoSession->setActive(false);
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

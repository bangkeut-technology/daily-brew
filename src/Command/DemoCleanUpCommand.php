<?php

declare(strict_types=1);

namespace App\Command;

use App\Repository\DemoSessionRepository;
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
    )
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $now = new DateTimeImmutable();
        $output->writeln('Cleaning up expired demo data and associated demo users...');
        $demoSessions = $this->demoSessionRepository->findActiveByExpirationDate($now);
        $output->writeln('Done!');
        return Command::SUCCESS;
    }
}

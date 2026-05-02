<?php

declare(strict_types=1);

namespace App\Command;

use App\Enum\AdminAuditActionEnum;
use App\Enum\UserRoleEnum;
use App\Repository\UserRepository;
use App\Service\AdminAuditService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Promote a user to super admin from the CLI. This is the only path that
 * doesn't require an existing super admin, so it covers both the initial
 * bootstrap and recovery if every admin gets demoted. Demote and all other
 * admin actions stay in the /admin web UI.
 */
#[AsCommand(
    name: 'dailybrew:admin:promote-user',
    description: 'Grant ROLE_SUPER_ADMIN to a user by email.',
)]
class PromoteUserCommand extends Command
{
    private const string AUDIT_ACTOR_LABEL = 'cli:dailybrew:admin:promote-user';

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly AdminAuditService $auditService,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Email address of the user to promote');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $rawEmail = trim((string) $input->getArgument('email'));

        if ($rawEmail === '') {
            $io->error('Email is required.');
            return Command::FAILURE;
        }

        $user = $this->userRepository->findByEmail($rawEmail);
        if ($user === null) {
            $io->error(sprintf('No user found with email "%s".', $rawEmail));
            return Command::FAILURE;
        }

        if ($user->hasRole(UserRoleEnum::SUPER_ADMIN->value)) {
            $io->note(sprintf('%s is already a super admin.', $user->getEmail()));
            return Command::SUCCESS;
        }

        $user->setSuperAdmin(true);
        $this->userRepository->update($user);

        $this->auditService->recordSystem(
            actorLabel: self::AUDIT_ACTOR_LABEL,
            action: AdminAuditActionEnum::PromoteUser,
            targetType: 'user',
            targetPublicId: (string) $user->getPublicId(),
            targetLabel: $user->getEmail(),
        );

        $io->success(sprintf('%s has been promoted to ROLE_SUPER_ADMIN.', $user->getEmail()));
        $io->writeln('They can access /admin on their next sign-in (or now if their JWT is fresh — role is loaded per-request).');

        return Command::SUCCESS;
    }
}

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
use App\Enum\WorkspaceRoleEnum;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceUserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Exception\InvalidArgumentException;
use Symfony\Component\Console\Exception\RuntimeException;
use Symfony\Component\Console\Input\InputArgument;
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
        private readonly EntityManagerInterface $em,
        private readonly UserRepository         $userRepository,
    )
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('set-current', null, InputOption::VALUE_NONE, 'Set created workspace as user current workspace')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Do not write to DB')
            ->addOption('batch-size', null, InputOption::VALUE_REQUIRED, 'Flush batch size', '200');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $setCurrent = (bool)$input->getOption('set-current');
        $dryRun = (bool)$input->getOption('dry-run');
        $batchSize = max(1, (int)$input->getOption('batch-size'));

        $io->note(sprintf(
            'Mode: %s | set-current: %s',
            $dryRun ? 'DRY-RUN' : 'WRITE',
            $setCurrent ? 'yes' : 'no'
        ));

        /**
         * This assumes ownership is stored via WorkspaceUser(role=OWNER).
         * If your ownership model is Workspace.owner instead, tell me and I’ll rewrite the query.
         */
        $dql = sprintf(
            'SELECT u
             FROM %s u
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM %s wm
                 WHERE wm.user = u AND wm.role = :ownerRole
             )
             ORDER BY u.id',
            User::class,
            WorkspaceUser::class
        );

        $iterable = $this->userRepository->createQueryBuilder('u')
            ->leftJoin('u.workspaces', 'wu')
            ->andWhere('wu.id IS NULL')
            ->orderBy('u.id', 'ASC')
            ->getQuery()
            ->toIterable();

        $processed = 0;
        $created = 0;

        foreach ($iterable as $user) {
            assert($user instanceof User);

            // Create workspace + owner membership
            $workspace = new Workspace();
            $workspace->setName($this->defaultWorkspaceName($user));

            $member = new WorkspaceUser();
            $member->setWorkspace($workspace);
            $member->setUser($user);
            $member->setRole(WorkspaceRoleEnum::OWNER);

            if ($setCurrent && method_exists($user, 'setCurrentWorkspace')) {
                $user->setCurrentWorkspace($workspace);
                $this->em->persist($user);
            }

            $this->em->persist($workspace);
            $this->em->persist($member);

            $processed++;
            $created++;

            if (!$dryRun && $processed % $batchSize === 0) {
                $this->em->flush();
                $this->em->clear();
            }
        }

        if ($dryRun) {
            $io->success(sprintf('Dry-run complete. Workspaces that would be created: %d', $created));
            return Command::SUCCESS;
        }

        $this->em->flush();
        $this->em->clear();

        $io->success(sprintf('Bootstrap complete. Workspaces created: %d', $created));
        $io->warning('This command is intended for one-time launch usage. Remove it after running.');

        return Command::SUCCESS;
    }

    private function defaultWorkspaceName(User $user): string
    {
        if (method_exists($user, 'getFullName')) {
            $fullName = trim((string)$user->getFullName());
            if ($fullName !== '') {
                return sprintf("%s's Workspace", $fullName);
            }
        }

        $email = (string)($user->getEmail() ?? '');
        $prefix = ($email !== '' && str_contains($email, '@')) ? (string)strstr($email, '@', true) : 'User';

        return sprintf("%s's Workspace", $prefix ?: 'User');
    }

    private function uniqueSlugForUser(User $user, string $name): string
    {
        // Avoid extra DB queries for uniqueness: include user id/publicId suffix
        $base = $this->slugify($name);

        $suffix = null;
        if (method_exists($user, 'getPublicId') && $user->getPublicId()) {
            $suffix = (string)$user->getPublicId();
        } else {
            $suffix = (string)$user->getId();
        }

        $suffix = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $suffix) ?? $suffix;

        return sprintf('%s-%s', $base, substr($suffix, 0, 12));
    }

    private function slugify(string $value): string
    {
        $value = mb_strtolower(trim($value));
        $value = preg_replace('~[^\pL\d]+~u', '-', $value) ?? $value;
        $value = trim($value, '-');
        $value = preg_replace('~-+~', '-', $value) ?? $value;

        return $value !== '' ? $value : 'workspace';
    }
}

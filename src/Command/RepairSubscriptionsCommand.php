<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Subscription;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\SubscriptionRepository;
use App\Service\WorkspaceService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Repairs subscription rows left inconsistent by two fixed bugs:
 *
 *  1. A late Paddle status webhook (dunning, a retry) overwrote the status of a subscription that
 *     had already been cancelled, leaving a row that is "canceled at X" and "past due" at once.
 *  2. Workspace deletion only cancelled subscriptions that were active|trialing, so a past_due or
 *     paused one survived the deletion — still billable at Paddle, attached to a deleted account.
 *
 * Reports by default. --apply writes locally; only --cancel-at-paddle talks to Paddle, because
 * cancelling someone's subscription for real is not something a repair script should do because an
 * operator typed the command name.
 */
#[AsCommand(
    name: 'dailybrew:admin:repair-subscriptions',
    description: 'Find (and optionally fix) subscriptions whose status drifted away from their cancellation.',
)]
class RepairSubscriptionsCommand extends Command
{
    public function __construct(
        private readonly SubscriptionRepository $subscriptionRepository,
        private readonly WorkspaceService $workspaceService,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('apply', null, InputOption::VALUE_NONE, 'Write the local fixes. Without this the command only reports.')
            ->addOption(
                'cancel-at-paddle',
                null,
                InputOption::VALUE_NONE,
                'Also cancel the still-live subscriptions of deleted workspaces at Paddle. Requires --apply.',
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $apply = (bool) $input->getOption('apply');
        $cancelAtPaddle = (bool) $input->getOption('cancel-at-paddle');

        if ($cancelAtPaddle && !$apply) {
            $io->error('--cancel-at-paddle changes state at Paddle, so it only runs together with --apply.');

            return Command::FAILURE;
        }

        $drifted = $this->subscriptionRepository->findCanceledWithDriftedStatus();
        $orphaned = $this->subscriptionRepository->findLiveForDeletedWorkspaces();

        if ($drifted === [] && $orphaned === []) {
            $io->success('Nothing to repair.');

            return Command::SUCCESS;
        }

        $this->report($io, 'Cancelled, but the status says otherwise', $drifted);
        $this->report($io, 'Still live, but the workspace is deleted', $orphaned);

        if (!$apply) {
            $io->note('Dry run. Re-run with --apply to write these fixes (add --cancel-at-paddle to also cancel at Paddle).');

            return Command::SUCCESS;
        }

        foreach ($drifted as $subscription) {
            // Local-only: the cancellation already happened, the status just lost the argument
            // with a webhook. Nothing to tell Paddle.
            $subscription->setStatus(SubscriptionStatusEnum::Canceled);
        }

        $paddleCancelled = 0;
        foreach ($orphaned as $subscription) {
            if ($cancelAtPaddle && $subscription->getPaddleSubscriptionId() !== null) {
                // Paddle first, then the local mark — same order as workspace deletion, and it
                // flushes for us.
                $this->workspaceService->forceCancelSubscription($subscription);
                $paddleCancelled++;
                continue;
            }

            $subscription->setStatus(SubscriptionStatusEnum::Canceled);
            if ($subscription->getCanceledAt() === null) {
                // Date it from the deletion rather than from now: that is when the customer
                // actually left, and churn reporting counts by this field.
                $subscription->setCanceledAt($subscription->getWorkspace()->getDeletedAt());
            }
        }

        $this->subscriptionRepository->flush();

        $io->success(sprintf(
            'Repaired %d drifted and %d orphaned subscription(s).',
            count($drifted),
            count($orphaned),
        ));

        if ($cancelAtPaddle) {
            $io->text(sprintf('%d cancelled at Paddle.', $paddleCancelled));
        } elseif ($orphaned !== []) {
            $io->warning(
                'The orphaned rows were only marked locally. If their Paddle subscriptions are still '
                .'live, the customer keeps being billed — re-run with --cancel-at-paddle, or cancel '
                .'them in the Paddle dashboard.',
            );
        }

        return Command::SUCCESS;
    }

    /** @param Subscription[] $subscriptions */
    private function report(SymfonyStyle $io, string $heading, array $subscriptions): void
    {
        if ($subscriptions === []) {
            return;
        }

        $io->section(sprintf('%s (%d)', $heading, count($subscriptions)));
        $io->table(
            ['Workspace', 'Owner', 'Plan', 'Status', 'Cancelled at', 'Workspace deleted', 'Paddle id'],
            array_map(static fn (Subscription $s) => [
                $s->getWorkspace()->getName() ?? '—',
                $s->getWorkspace()->getOwner()?->getEmail() ?? '—',
                $s->getPlan()->value,
                $s->getStatus()->value,
                $s->getCanceledAt()?->format('Y-m-d') ?? '—',
                $s->getWorkspace()->getDeletedAt()?->format('Y-m-d') ?? '—',
                $s->getPaddleSubscriptionId() ?? '—',
            ], $subscriptions),
        );
    }
}

<?php

declare(strict_types=1);

namespace App\Tests\Unit\Command;

use App\Command\RepairSubscriptionsCommand;
use App\Entity\Subscription;
use App\Entity\Workspace;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\SubscriptionRepository;
use App\Service\WorkspaceService;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;

#[AllowMockObjectsWithoutExpectations]
class RepairSubscriptionsCommandTest extends TestCase
{
    private SubscriptionRepository&MockObject $subscriptionRepository;
    private WorkspaceService&MockObject $workspaceService;

    protected function setUp(): void
    {
        $this->subscriptionRepository = $this->createMock(SubscriptionRepository::class);
        $this->workspaceService = $this->createMock(WorkspaceService::class);
    }

    public function testItReportsWithoutWritingByDefault(): void
    {
        $drifted = $this->subscription(SubscriptionStatusEnum::PastDue, canceledAt: '2026-08-01');
        $this->subscriptionRepository->method('findCanceledWithDriftedStatus')->willReturn([$drifted]);
        $this->subscriptionRepository->method('findLiveForDeletedWorkspaces')->willReturn([]);

        // A repair command that repairs on sight is a repair command nobody runs on prod.
        $this->subscriptionRepository->expects($this->never())->method('flush');

        $tester = $this->runCommand([]);

        $this->assertSame(Command::SUCCESS, $tester->getStatusCode());
        $this->assertStringContainsString('Dry run', $tester->getDisplay());
        $this->assertSame(SubscriptionStatusEnum::PastDue, $drifted->getStatus());
    }

    public function testApplyFixesADriftedStatusWithoutTouchingTheCancellationDate(): void
    {
        $canceledAt = new \DateTimeImmutable('2026-08-01 10:00:00');
        $drifted = $this->subscription(SubscriptionStatusEnum::PastDue);
        $drifted->setCanceledAt($canceledAt);

        $this->subscriptionRepository->method('findCanceledWithDriftedStatus')->willReturn([$drifted]);
        $this->subscriptionRepository->method('findLiveForDeletedWorkspaces')->willReturn([]);
        $this->subscriptionRepository->expects($this->once())->method('flush');
        // The cancellation already happened; only the status lost the argument with a webhook.
        $this->workspaceService->expects($this->never())->method('forceCancelSubscription');

        $tester = $this->runCommand(['--apply' => true]);

        $this->assertSame(SubscriptionStatusEnum::Canceled, $drifted->getStatus());
        $this->assertSame($canceledAt, $drifted->getCanceledAt());
        $this->assertStringContainsString('Repaired 1 drifted', $tester->getDisplay());
    }

    public function testApplyDatesAnOrphanedCancellationFromTheWorkspaceDeletion(): void
    {
        $deletedAt = new \DateTimeImmutable('2026-07-15 08:00:00');
        $orphan = $this->subscription(SubscriptionStatusEnum::PastDue, deletedAt: $deletedAt);

        $this->subscriptionRepository->method('findCanceledWithDriftedStatus')->willReturn([]);
        $this->subscriptionRepository->method('findLiveForDeletedWorkspaces')->willReturn([$orphan]);
        $this->subscriptionRepository->expects($this->once())->method('flush');

        $tester = $this->runCommand(['--apply' => true]);

        $this->assertSame(SubscriptionStatusEnum::Canceled, $orphan->getStatus());
        // Churn counts by canceledAt, so the customer left when their workspace went, not today.
        $this->assertEquals($deletedAt, $orphan->getCanceledAt());
        $this->assertStringContainsString('only marked locally', $tester->getDisplay());
    }

    public function testPaddleIsOnlyCalledWhenExplicitlyAskedFor(): void
    {
        $orphan = $this->subscription(SubscriptionStatusEnum::PastDue, deletedAt: new \DateTimeImmutable('2026-07-15'));
        $orphan->setPaddleSubscriptionId('sub_paddle_123');

        $this->subscriptionRepository->method('findCanceledWithDriftedStatus')->willReturn([]);
        $this->subscriptionRepository->method('findLiveForDeletedWorkspaces')->willReturn([$orphan]);
        $this->workspaceService->expects($this->once())
            ->method('forceCancelSubscription')
            ->with($orphan);

        $tester = $this->runCommand(['--apply' => true, '--cancel-at-paddle' => true]);

        $this->assertStringContainsString('1 cancelled at Paddle', $tester->getDisplay());
    }

    public function testCancellingAtPaddleRefusesToRunAsADryRun(): void
    {
        // --cancel-at-paddle without --apply reads like "show me what you'd cancel", but it would
        // actually cancel. Refusing beats guessing which the operator meant.
        $this->subscriptionRepository->expects($this->never())->method('findLiveForDeletedWorkspaces');
        $this->workspaceService->expects($this->never())->method('forceCancelSubscription');

        $tester = $this->runCommand(['--cancel-at-paddle' => true]);

        $this->assertSame(Command::FAILURE, $tester->getStatusCode());
        $this->assertStringContainsString('changes state at Paddle', $tester->getDisplay());
    }

    public function testCleanDataIsReportedAsSuchAndWritesNothing(): void
    {
        $this->subscriptionRepository->method('findCanceledWithDriftedStatus')->willReturn([]);
        $this->subscriptionRepository->method('findLiveForDeletedWorkspaces')->willReturn([]);
        $this->subscriptionRepository->expects($this->never())->method('flush');

        $tester = $this->runCommand(['--apply' => true]);

        $this->assertSame(Command::SUCCESS, $tester->getStatusCode());
        $this->assertStringContainsString('Nothing to repair', $tester->getDisplay());
    }

    /** @param array<string, mixed> $input */
    private function runCommand(array $input): CommandTester
    {
        $application = new Application();
        $application->addCommand(new RepairSubscriptionsCommand($this->subscriptionRepository, $this->workspaceService));

        $tester = new CommandTester($application->find('dailybrew:admin:repair-subscriptions'));
        $tester->execute($input);

        return $tester;
    }

    private function subscription(
        SubscriptionStatusEnum $status,
        ?string $canceledAt = null,
        ?\DateTimeImmutable $deletedAt = null,
    ): Subscription {
        $workspace = (new Workspace())->setName('The Daily Grind');
        if ($deletedAt !== null) {
            $workspace->setDeletedAt($deletedAt);
        }

        $subscription = (new Subscription())->setStatus($status);
        $subscription->setWorkspace($workspace);
        if ($canceledAt !== null) {
            $subscription->setCanceledAt(new \DateTimeImmutable($canceledAt));
        }

        return $subscription;
    }
}

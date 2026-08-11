<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Subscription;
use App\Entity\Workspace;
use App\Enum\PlanEnum;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\SubscriptionRepository;
use App\Repository\WorkspaceRepository;
use App\Service\PaddleWebhookService;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;

class PaddleWebhookServiceTest extends TestCase
{
    private SubscriptionRepository&MockObject $subscriptionRepository;
    private WorkspaceRepository&Stub $workspaceRepository;
    private PaddleWebhookService $service;

    protected function setUp(): void
    {
        $this->subscriptionRepository = $this->createMock(SubscriptionRepository::class);
        $this->workspaceRepository = $this->createStub(WorkspaceRepository::class);

        $this->service = new PaddleWebhookService(
            subscriptionRepository: $this->subscriptionRepository,
            workspaceRepository: $this->workspaceRepository,
            logger: new NullLogger(),
            paddlePriceIdEspressoMonthly: 'pri_espresso_monthly',
            paddlePriceIdEspressoAnnual: 'pri_espresso_annual',
            paddlePriceIdDoubleEspressoMonthly: 'pri_double_monthly',
            paddlePriceIdDoubleEspressoAnnual: 'pri_double_annual',
        );
    }

    public function testSubscriptionCreatedWithEspressoMonthly(): void
    {
        $workspace = $this->createStub(Workspace::class);
        $this->workspaceRepository->method('findByPublicId')->willReturn($workspace);

        $subscription = new Subscription();
        $subscription->setWorkspace($workspace);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);
        $this->subscriptionRepository->expects($this->atLeastOnce())->method('flush');

        $this->service->handleEvent([
            'event_type' => 'subscription.created',
            'data' => [
                'id' => 'sub_123',
                'status' => 'active',
                'customer_id' => 'ctm_456',
                'custom_data' => ['workspace_public_id' => 'abc123'],
                'items' => [
                    ['price' => ['id' => 'pri_espresso_monthly']],
                ],
            ],
        ]);

        $this->assertSame(PlanEnum::Espresso, $subscription->getPlan());
        $this->assertSame(SubscriptionStatusEnum::Active, $subscription->getStatus());
    }

    public function testSubscriptionCreatedWithDoubleEspressoAnnual(): void
    {
        $workspace = $this->createStub(Workspace::class);
        $this->workspaceRepository->method('findByPublicId')->willReturn($workspace);

        $subscription = new Subscription();
        $subscription->setWorkspace($workspace);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);
        $this->subscriptionRepository->expects($this->atLeastOnce())->method('flush');

        $this->service->handleEvent([
            'event_type' => 'subscription.created',
            'data' => [
                'id' => 'sub_789',
                'status' => 'active',
                'customer_id' => 'ctm_012',
                'custom_data' => ['workspace_public_id' => 'xyz789'],
                'items' => [
                    ['price' => ['id' => 'pri_double_annual']],
                ],
            ],
        ]);

        $this->assertSame(PlanEnum::DoubleEspresso, $subscription->getPlan());
    }

    public function testSubscriptionUpdatedChangesPlan(): void
    {
        $subscription = new Subscription();
        $subscription->setWorkspace($this->createStub(Workspace::class));
        $subscription->setPlan(PlanEnum::Espresso);

        $this->subscriptionRepository->method('findByPaddleSubscriptionId')->willReturn($subscription);
        $this->subscriptionRepository->expects($this->atLeastOnce())->method('flush');

        $this->service->handleEvent([
            'event_type' => 'subscription.updated',
            'data' => [
                'id' => 'sub_123',
                'status' => 'active',
                'items' => [
                    ['price' => ['id' => 'pri_double_monthly']],
                ],
            ],
        ]);

        $this->assertSame(PlanEnum::DoubleEspresso, $subscription->getPlan());
    }

    public function testSubscriptionCanceled(): void
    {
        $subscription = new Subscription();
        $subscription->setWorkspace($this->createStub(Workspace::class));
        $subscription->setStatus(SubscriptionStatusEnum::Active);

        $this->subscriptionRepository->method('findByPaddleSubscriptionId')->willReturn($subscription);
        $this->subscriptionRepository->expects($this->atLeastOnce())->method('flush');

        $this->service->handleEvent([
            'event_type' => 'subscription.canceled',
            'data' => ['id' => 'sub_123'],
        ]);

        $this->assertSame(SubscriptionStatusEnum::Canceled, $subscription->getStatus());
        $this->assertNotNull($subscription->getCanceledAt());
    }

    public function testSubscriptionPaused(): void
    {
        $subscription = new Subscription();
        $subscription->setWorkspace($this->createStub(Workspace::class));

        $this->subscriptionRepository->method('findByPaddleSubscriptionId')->willReturn($subscription);
        $this->subscriptionRepository->expects($this->atLeastOnce())->method('flush');

        $this->service->handleEvent([
            'event_type' => 'subscription.paused',
            'data' => ['id' => 'sub_123'],
        ]);

        $this->assertSame(SubscriptionStatusEnum::Paused, $subscription->getStatus());
    }

    public function testSubscriptionResumed(): void
    {
        $subscription = new Subscription();
        $subscription->setWorkspace($this->createStub(Workspace::class));
        $subscription->setStatus(SubscriptionStatusEnum::Paused);

        $this->subscriptionRepository->method('findByPaddleSubscriptionId')->willReturn($subscription);
        $this->subscriptionRepository->expects($this->atLeastOnce())->method('flush');

        $this->service->handleEvent([
            'event_type' => 'subscription.resumed',
            'data' => ['id' => 'sub_123'],
        ]);

        $this->assertSame(SubscriptionStatusEnum::Active, $subscription->getStatus());
    }

    /**
     * The bug this guards: a workspace was deleted (which cancels the subscription), then Paddle's
     * dunning caught up and flipped the row back to past_due. The account was gone and the admin
     * console showed "Espresso · Past due" for it.
     */
    #[DataProvider('lateStatusEvents')]
    public function testALateStatusWebhookCannotResurrectACanceledSubscription(string $eventType): void
    {
        $canceledAt = new \DateTimeImmutable('2026-08-01 10:00:00');
        $subscription = new Subscription();
        $subscription->setWorkspace($this->createStub(Workspace::class));
        $subscription->setStatus(SubscriptionStatusEnum::Canceled);
        $subscription->setCanceledAt($canceledAt);

        $this->subscriptionRepository->method('findByPaddleSubscriptionId')->willReturn($subscription);
        // Nothing changed, so nothing should be written.
        $this->subscriptionRepository->expects($this->never())->method('flush');

        $this->service->handleEvent([
            'event_type' => $eventType,
            'data' => ['id' => 'sub_123', 'status' => 'past_due'],
        ]);

        $this->assertSame(SubscriptionStatusEnum::Canceled, $subscription->getStatus());
        $this->assertSame($canceledAt, $subscription->getCanceledAt());
    }

    /** @return iterable<string, array{0: string}> */
    public static function lateStatusEvents(): iterable
    {
        yield 'past_due' => ['subscription.past_due'];
        yield 'updated' => ['subscription.updated'];
        yield 'paused' => ['subscription.paused'];
        yield 'resumed' => ['subscription.resumed'];
    }

    /**
     * The guard keys on canceledAt rather than the status, so rows that already drifted — canceled
     * date set, status says past_due — stop drifting further instead of staying overwritable.
     */
    public function testAlreadyDriftedRowsAreAlsoProtected(): void
    {
        $subscription = new Subscription();
        $subscription->setWorkspace($this->createStub(Workspace::class));
        $subscription->setStatus(SubscriptionStatusEnum::PastDue);
        $subscription->setCanceledAt(new \DateTimeImmutable('2026-08-01 10:00:00'));

        $this->subscriptionRepository->method('findByPaddleSubscriptionId')->willReturn($subscription);
        $this->subscriptionRepository->expects($this->never())->method('flush');

        $this->service->handleEvent([
            'event_type' => 'subscription.updated',
            'data' => ['id' => 'sub_123', 'status' => 'active', 'items' => [['price' => ['id' => 'pri_double_monthly']]]],
        ]);

        $this->assertSame(SubscriptionStatusEnum::PastDue, $subscription->getStatus());
        $this->assertNotSame(PlanEnum::DoubleEspresso, $subscription->getPlan());
    }

    /**
     * The other side of the guard: a customer who cancels and comes back gets a new Paddle
     * subscription id, which arrives as subscription.created. One row per workspace means that row
     * has to come back to life, so the cancellation is cleared there.
     */
    public function testResubscribingClearsTheCancellationAndRevivesTheRow(): void
    {
        $workspace = $this->createStub(Workspace::class);
        $this->workspaceRepository->method('findByPublicId')->willReturn($workspace);

        $subscription = new Subscription();
        $subscription->setWorkspace($workspace);
        $subscription->setStatus(SubscriptionStatusEnum::Canceled);
        $subscription->setCanceledAt(new \DateTimeImmutable('2026-08-01 10:00:00'));
        $subscription->setPaddleSubscriptionId('sub_old');

        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);
        $this->subscriptionRepository->expects($this->atLeastOnce())->method('flush');

        $this->service->handleEvent([
            'event_type' => 'subscription.created',
            'data' => [
                'id' => 'sub_new',
                'status' => 'active',
                'custom_data' => ['workspace_public_id' => 'abc123'],
                'items' => [['price' => ['id' => 'pri_espresso_monthly']]],
            ],
        ]);

        $this->assertSame(SubscriptionStatusEnum::Active, $subscription->getStatus());
        $this->assertNull($subscription->getCanceledAt());
        $this->assertSame('sub_new', $subscription->getPaddleSubscriptionId());
    }

    public function testSubscriptionCreatedSkipsWhenWorkspaceNotFound(): void
    {
        $this->workspaceRepository->method('findByPublicId')->willReturn(null);
        $this->subscriptionRepository->expects($this->never())->method('flush');

        $this->service->handleEvent([
            'event_type' => 'subscription.created',
            'data' => [
                'id' => 'sub_123',
                'status' => 'active',
                'custom_data' => ['workspace_public_id' => 'nonexistent'],
                'items' => [['price' => ['id' => 'pri_espresso_monthly']]],
            ],
        ]);
    }

    public function testSubscriptionCreatedSkipsWhenMissingWorkspaceId(): void
    {
        $this->subscriptionRepository->expects($this->never())->method('flush');

        $this->service->handleEvent([
            'event_type' => 'subscription.created',
            'data' => [
                'id' => 'sub_123',
                'status' => 'active',
                'custom_data' => [],
                'items' => [],
            ],
        ]);
    }

    public function testUnknownPriceIdFallsBackToEspresso(): void
    {
        $workspace = $this->createStub(Workspace::class);
        $this->workspaceRepository->method('findByPublicId')->willReturn($workspace);

        $subscription = new Subscription();
        $subscription->setWorkspace($workspace);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);
        $this->subscriptionRepository->expects($this->atLeastOnce())->method('flush');

        $this->service->handleEvent([
            'event_type' => 'subscription.created',
            'data' => [
                'id' => 'sub_123',
                'status' => 'active',
                'customer_id' => 'ctm_456',
                'custom_data' => ['workspace_public_id' => 'abc123'],
                'items' => [
                    ['price' => ['id' => 'pri_unknown_plan']],
                ],
            ],
        ]);

        $this->assertSame(PlanEnum::Espresso, $subscription->getPlan());
    }
}

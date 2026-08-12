<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Subscription;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\PlanEnum;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Service\AdminChurnService;
use App\Service\DateService;
use DateTimeZone;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

#[AllowMockObjectsWithoutExpectations]
class AdminChurnServiceTest extends TestCase
{
    private const string NOW = '2026-08-10 12:00:00';

    private SubscriptionRepository&MockObject $subscriptions;
    private WorkspaceRepository&MockObject $workspaces;
    private UserRepository&MockObject $users;
    private AdminChurnService $svc;

    protected function setUp(): void
    {
        DateService::setClock(new MockClock(self::NOW, new DateTimeZone('UTC')));
        $this->subscriptions = $this->createMock(SubscriptionRepository::class);
        $this->workspaces = $this->createMock(WorkspaceRepository::class);
        $this->users = $this->createMock(UserRepository::class);
        $this->svc = new AdminChurnService($this->subscriptions, $this->workspaces, $this->users);
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
    }

    public function testChurnRatesUseChurnedPlusRetainedAsDenominator(): void
    {
        $this->subscriptions->method('countPaidCanceledSince')->willReturnCallback(
            // -90 days is the window, -30 days the headline: distinguish the two
            // calls by how far back the argument reaches.
            fn (\DateTimeInterface $since) => $since->format('Y-m-d') === '2026-07-11' ? 2 : 6,
        );
        $this->subscriptions->method('countLivePaid')->willReturn(94);
        $this->workspaces->method('countDeletedSince')->willReturn(5);
        $this->workspaces->method('countLive')->willReturn(95);

        $summary = $this->svc->build(90)['summary'];

        $this->assertSame(6, $summary['paidChurned']);
        $this->assertSame(2, $summary['paidChurnedLast30d']);
        $this->assertSame(94, $summary['livePaid']);
        // 6 / (94 + 6)
        $this->assertSame(6.0, $summary['paidChurnRate']);
        // 2 / (94 + 2) = 2.083…
        $this->assertSame(2.1, $summary['paidChurnRateLast30d']);
        // 5 / (95 + 5)
        $this->assertSame(5.0, $summary['workspaceChurnRate']);
    }

    public function testRatesAreZeroWhenNothingIsLiveOrChurned(): void
    {
        $this->subscriptions->method('countPaidCanceledSince')->willReturn(0);
        $this->subscriptions->method('countLivePaid')->willReturn(0);
        $this->workspaces->method('countDeletedSince')->willReturn(0);
        $this->workspaces->method('countLive')->willReturn(0);

        $summary = $this->svc->build(30)['summary'];

        $this->assertSame(0.0, $summary['paidChurnRate']);
        $this->assertSame(0.0, $summary['workspaceChurnRate']);
        $this->assertNull($summary['avgLifetimeDays']);
    }

    public function testDeletedWorkspaceEmitsOneEventCarryingItsPlanNotTwo(): void
    {
        $workspace = $this->workspace('Brew & Co', createdAt: '2026-01-10 08:00:00', deletedAt: '2026-08-01 09:30:00');
        $subscription = $this->subscription($workspace, PlanEnum::Espresso, canceledAt: '2026-08-01 09:30:00');

        $this->workspaces->method('findDeletedSince')->willReturn([$workspace]);
        $this->subscriptions->method('findByWorkspaces')
            ->willReturn([$workspace->getPublicId() => $subscription]);
        $this->subscriptions->method('findPaidCanceledSince')->willReturn([$subscription]);

        $events = $this->svc->build(90)['events'];

        $this->assertSame(1, $events['total']);
        $event = $events['items'][0];
        $this->assertSame('workspace_deleted', $event['type']);
        $this->assertSame('espresso', $event['plan']);
        $this->assertTrue($event['wasPaid']);
        $this->assertSame('Brew & Co', $event['workspace']['name']);
        $this->assertSame('owner@dailybrew.work', $event['owner']['email']);
        // 2026-01-10 → 2026-08-01
        $this->assertSame(203, $event['lifetimeDays']);
    }

    public function testDowngradeWithoutDeletionStaysASubscriptionEvent(): void
    {
        $deleted = $this->workspace('Gone', createdAt: '2026-06-01 08:00:00', deletedAt: '2026-08-05 10:00:00');
        $kept = $this->workspace('Still here', createdAt: '2026-05-01 08:00:00');
        $canceled = $this->subscription($kept, PlanEnum::DoubleEspresso, canceledAt: '2026-08-07 15:00:00');

        $this->workspaces->method('findDeletedSince')->willReturn([$deleted]);
        $this->subscriptions->method('findByWorkspaces')->willReturn([]);
        $this->subscriptions->method('findPaidCanceledSince')->willReturn([$canceled]);

        $events = $this->svc->build(90)['events'];

        $this->assertSame(2, $events['total']);
        // Newest first: the 2026-08-07 cancellation precedes the 2026-08-05 deletion.
        $this->assertSame(['subscription_canceled', 'workspace_deleted'], array_column($events['items'], 'type'));
        $this->assertSame('double_espresso', $events['items'][0]['plan']);
        // No subscription row was found for the deleted workspace: plan unknown,
        // and it must not be reported as paid churn.
        $this->assertNull($events['items'][1]['plan']);
        $this->assertFalse($events['items'][1]['wasPaid']);
    }

    public function testUserChurnRateCountsDeletedAccountsAgainstLiveOnes(): void
    {
        $this->subscriptions->method('countPaidCanceledSince')->willReturn(0);
        $this->subscriptions->method('countLivePaid')->willReturn(0);
        $this->workspaces->method('countDeletedSince')->willReturn(0);
        $this->workspaces->method('countLive')->willReturn(0);
        $this->users->method('countDeletedSince')->willReturnCallback(
            // -90 days is the window, -30 days the headline.
            fn (\DateTimeInterface $since) => $since->format('Y-m-d') === '2026-07-11' ? 3 : 7,
        );
        $this->users->method('countLive')->willReturn(193);

        $summary = $this->svc->build(90)['summary'];

        $this->assertSame(7, $summary['usersDeleted']);
        $this->assertSame(3, $summary['usersDeletedLast30d']);
        $this->assertSame(193, $summary['liveUsers']);
        // 7 / (193 + 7)
        $this->assertSame(3.5, $summary['userChurnRate']);
    }

    public function testAccountDeletionWithoutAWorkspaceIsItsOwnEvent(): void
    {
        // An employee or manager with no workspace of their own: churn that
        // neither the paid nor the workspace counter would ever have seen.
        $user = $this->user('sous.chef@dailybrew.work', createdAt: '2026-06-01 00:00:00', deletedAt: '2026-08-06 09:00:00');

        $this->workspaces->method('findDeletedSince')->willReturn([]);
        $this->subscriptions->method('findByWorkspaces')->willReturn([]);
        $this->subscriptions->method('findPaidCanceledSince')->willReturn([]);
        $this->users->method('findDeletedSince')->willReturn([$user]);

        $events = $this->svc->build(90)['events'];

        $this->assertSame(1, $events['total']);
        $event = $events['items'][0];
        $this->assertSame('user_deleted', $event['type']);
        // Nothing to link to, and no revenue was lost.
        $this->assertNull($event['workspace']);
        $this->assertNull($event['plan']);
        $this->assertFalse($event['wasPaid']);
        // The `_deleted_…` suffix is an implementation detail of freeing the
        // unique email — admins need to recognise who left.
        $this->assertSame('sous.chef@dailybrew.work', $event['owner']['email']);
        // 2026-06-01 → 2026-08-06
        $this->assertSame(66, $event['lifetimeDays']);
    }

    public function testOwnerDeletingTheirAccountDoesNotDoubleCountTheWorkspaceDeletion(): void
    {
        $owner = $this->user('owner@dailybrew.work', createdAt: '2026-01-10 08:00:00', deletedAt: '2026-08-01 09:30:00');
        $workspace = $this->workspace('Brew & Co', createdAt: '2026-01-10 08:00:00', deletedAt: '2026-08-01 09:30:00', owner: $owner);

        $this->workspaces->method('findDeletedSince')->willReturn([$workspace]);
        $this->subscriptions->method('findByWorkspaces')->willReturn([]);
        $this->subscriptions->method('findPaidCanceledSince')->willReturn([]);
        $this->users->method('findDeletedSince')->willReturn([$owner]);

        $events = $this->svc->build(90)['events'];

        // The workspace deletion is the louder signal and already names the owner.
        $this->assertSame(1, $events['total']);
        $this->assertSame('workspace_deleted', $events['items'][0]['type']);
        $this->assertSame('owner@dailybrew.work', $events['items'][0]['owner']['email']);
    }

    public function testAverageLifetimeSpansEveryEventInTheWindow(): void
    {
        $a = $this->workspace('A', createdAt: '2026-07-01 00:00:00', deletedAt: '2026-07-11 00:00:00'); // 10 days
        $b = $this->workspace('B', createdAt: '2026-06-01 00:00:00');
        $subB = $this->subscription($b, PlanEnum::Espresso, canceledAt: '2026-06-21 00:00:00'); // 20 days

        $this->workspaces->method('findDeletedSince')->willReturn([$a]);
        $this->subscriptions->method('findByWorkspaces')->willReturn([]);
        $this->subscriptions->method('findPaidCanceledSince')->willReturn([$subB]);

        $this->assertSame(15, $this->svc->build(90)['summary']['avgLifetimeDays']);
    }

    public function testEventsPaginateInPagesOfTwentyFive(): void
    {
        $deleted = [];
        for ($i = 1; $i <= 30; $i++) {
            $deleted[] = $this->workspace(
                sprintf('WS %02d', $i),
                createdAt: '2026-01-01 00:00:00',
                deletedAt: sprintf('2026-07-%02d 00:00:00', $i),
            );
        }

        $this->workspaces->method('findDeletedSince')->willReturn($deleted);
        $this->subscriptions->method('findByWorkspaces')->willReturn([]);
        $this->subscriptions->method('findPaidCanceledSince')->willReturn([]);

        $firstPage = $this->svc->build(90)['events'];
        $this->assertSame(30, $firstPage['total']);
        $this->assertCount(25, $firstPage['items']);
        $this->assertSame('WS 30', $firstPage['items'][0]['workspace']['name']);

        $secondPage = $this->svc->build(90, 2)['events'];
        $this->assertCount(5, $secondPage['items']);
        $this->assertSame(2, $secondPage['page']);
        $this->assertSame('WS 05', $secondPage['items'][0]['workspace']['name']);
    }

    public function testSeriesCoversTwelveMonthsOldestFirstAndZeroFills(): void
    {
        $this->subscriptions->method('countPaidCanceledByMonthSince')->willReturn(['2026-07' => 3]);
        $this->workspaces->method('countDeletedByMonthSince')->willReturn(['2025-09' => 1, '2026-08' => 2]);
        $this->users->method('countDeletedByMonthSince')->willReturn(['2026-08' => 5]);

        $series = $this->svc->build(90)['series'];

        $this->assertCount(12, $series);
        $this->assertSame('2025-09', $series[0]['month']);
        $this->assertSame('2026-08', $series[11]['month']);
        $this->assertSame(1, $series[0]['workspacesDeleted']);
        $this->assertSame(0, $series[0]['paidCanceled']);
        $this->assertSame(0, $series[0]['usersDeleted']);
        $this->assertSame(3, $series[10]['paidCanceled']);
        $this->assertSame(2, $series[11]['workspacesDeleted']);
        $this->assertSame(5, $series[11]['usersDeleted']);
    }

    public function testUnsupportedWindowFallsBackToNinetyDays(): void
    {
        $this->subscriptions->method('countPaidCanceledSince')->willReturn(0);
        $this->workspaces->method('countDeletedSince')->willReturn(0);

        $this->assertSame(90, $this->svc->build(7)['windowDays']);
        $this->assertSame(365, $this->svc->build(365)['windowDays']);
    }

    public function testDormantRowsReportHowLongThePaidAccountHasBeenQuiet(): void
    {
        $this->workspaces->method('findDormantPaidWorkspaces')->willReturn([[
            'publicId' => 'abc123def456',
            'name' => 'Quiet Cafe',
            'ownerEmail' => 'quiet@dailybrew.work',
            'plan' => 'espresso',
            'lastActivity' => '2026-07-01',
        ]]);

        $result = $this->svc->build(90);

        $this->assertSame(21, $result['dormantAfterDays']);
        $this->assertCount(1, $result['dormant']);
        $this->assertSame('Quiet Cafe', $result['dormant'][0]['name']);
        // 2026-07-01 → 2026-08-10
        $this->assertSame(40, $result['dormant'][0]['daysQuiet']);
    }

    public function testDashboardSummaryReportsTheSameRateTheChurnPageWould(): void
    {
        $this->subscriptions->method('countPaidCanceledSince')->willReturn(6);
        $this->subscriptions->method('countLivePaid')->willReturn(94);
        $this->workspaces->method('countDeletedSince')->willReturn(3);
        $this->subscriptions->method('countPaidCanceledByMonthSince')->willReturn(['2026-08' => 6]);
        $this->workspaces->method('countDeletedByMonthSince')->willReturn(['2026-08' => 3]);
        $this->users->method('countDeletedSince')->willReturn(4);

        $summary = $this->svc->dashboardSummary();

        $this->assertSame(6, $summary['paidCanceledLast30d']);
        $this->assertSame(3, $summary['workspacesDeletedLast30d']);
        $this->assertSame(4, $summary['usersDeletedLast30d']);
        $this->assertSame(94, $summary['livePaid']);
        // 6 / (6 + 94) — the same churned ÷ (churned + live) denominator build() uses, so the
        // dashboard headline can't disagree with the churn page it links to.
        $this->assertSame(6.0, $summary['paidChurnRateLast30d']);
    }

    public function testDashboardSummaryCarriesTwelveZeroFilledMonths(): void
    {
        $this->subscriptions->method('countPaidCanceledSince')->willReturn(0);
        $this->subscriptions->method('countLivePaid')->willReturn(0);
        $this->workspaces->method('countDeletedSince')->willReturn(0);
        $this->subscriptions->method('countPaidCanceledByMonthSince')->willReturn(['2026-08' => 4]);
        $this->workspaces->method('countDeletedByMonthSince')->willReturn([]);

        $summary = $this->svc->dashboardSummary();

        $this->assertCount(12, $summary['series']);
        $this->assertSame('2025-09', $summary['series'][0]['month']);
        $this->assertSame('2026-08', $summary['series'][11]['month']);
        // Quiet months are still plotted — a gap in a bar chart reads as "no data", which is a
        // different claim from "nobody churned".
        $this->assertSame(0, $summary['series'][0]['paidCanceled']);
        $this->assertSame(4, $summary['series'][11]['paidCanceled']);
        // An empty denominator is 0.0, not a division by zero.
        $this->assertSame(0.0, $summary['paidChurnRateLast30d']);
    }

    private function workspace(
        string $name,
        string $createdAt,
        ?string $deletedAt = null,
        ?User $owner = null,
    ): Workspace {
        // The entity stamps createdAt from the clock, so wind it back to give
        // each workspace a real lifetime, then restore "now".
        DateService::setClock(new MockClock($createdAt, new DateTimeZone('UTC')));
        $workspace = (new Workspace())
            ->setName($name)
            ->setOwner($owner ?? (new User())->setEmail('owner@dailybrew.work'));
        DateService::setClock(new MockClock(self::NOW, new DateTimeZone('UTC')));

        if ($deletedAt !== null) {
            $workspace->setDeletedAt(DateService::parse($deletedAt));
        }

        return $workspace;
    }

    private function user(string $email, string $createdAt, ?string $deletedAt = null): User
    {
        DateService::setClock(new MockClock($createdAt, new DateTimeZone('UTC')));
        $user = (new User())->setEmail($email);
        DateService::setClock(new MockClock(self::NOW, new DateTimeZone('UTC')));

        if ($deletedAt !== null) {
            // AccountDeletionService frees the unique email by suffixing it —
            // reproduce that here so the display-name stripping is exercised.
            $user->setEmail($email.'_deleted_42_1754800000');
            $user->setDeletedAt(DateService::parse($deletedAt));
        }

        return $user;
    }

    private function subscription(Workspace $workspace, PlanEnum $plan, string $canceledAt): Subscription
    {
        return (new Subscription())
            ->setWorkspace($workspace)
            ->setPlan($plan)
            ->setStatus(SubscriptionStatusEnum::Canceled)
            ->setCanceledAt(DateService::parse($canceledAt));
    }
}

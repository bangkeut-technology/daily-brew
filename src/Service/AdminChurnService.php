<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Subscription;
use App\Entity\User;
use App\Entity\Workspace;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;

/**
 * Platform-wide churn for the admin section: how many paying workspaces stopped
 * paying, how many workspaces were deleted outright, how many people deleted
 * their account, the monthly trend, the event-by-event timeline, and the paid
 * accounts that have gone quiet (the leading indicator).
 *
 * Three shapes of churn are tracked separately on purpose:
 *  - **paid churn** — a subscription's `canceledAt` was stamped. That's lost
 *    revenue whether or not the workspace itself survives.
 *  - **workspace churn** — the workspace was soft-deleted. The account is gone,
 *    paid or not.
 *  - **user churn** — the person deleted their account (`User.deletedAt`). Not
 *    every deleted user owned a workspace: employees and managers churn too,
 *    and that never showed up in the two counters above.
 *
 * All three overlap: deleting a workspace also cancels its subscription, and
 * deleting an account deletes the workspaces it owned (see
 * AccountDeletionService). The counters keep all three (each answers a
 * different question) but the timeline emits one event per churned thing,
 * cheapest-signal-wins: a deleted workspace shows up as a deletion carrying its
 * plan rather than a separate cancellation, and a deleted account only gets its
 * own row when none of its workspaces were deleted in the same window.
 */
final readonly class AdminChurnService
{
    /** Windows the API accepts, in days. */
    public const array WINDOW_OPTIONS = [30, 90, 365];

    public const int DEFAULT_WINDOW_DAYS = 90;

    private const int EVENT_PAGE_SIZE = 25;

    /** A paid workspace with no check-in for this long is "at risk". */
    private const int DORMANT_AFTER_DAYS = 21;

    private const int DORMANT_LIMIT = 12;

    private const int SERIES_MONTHS = 12;

    public function __construct(
        private SubscriptionRepository $subscriptionRepository,
        private WorkspaceRepository $workspaceRepository,
        private UserRepository $userRepository,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function build(int $windowDays, int $page = 1): array
    {
        $windowDays = in_array($windowDays, self::WINDOW_OPTIONS, true) ? $windowDays : self::DEFAULT_WINDOW_DAYS;
        $page = max(1, $page);

        $since = DateService::relative(sprintf('-%d days', $windowDays));
        $since30d = DateService::relative('-30 days');

        $paidChurned = $this->subscriptionRepository->countPaidCanceledSince($since);
        $paidChurned30d = $windowDays === 30
            ? $paidChurned
            : $this->subscriptionRepository->countPaidCanceledSince($since30d);
        $livePaid = $this->subscriptionRepository->countLivePaid();

        $workspacesDeleted = $this->workspaceRepository->countDeletedSince($since);
        $workspacesDeleted30d = $windowDays === 30
            ? $workspacesDeleted
            : $this->workspaceRepository->countDeletedSince($since30d);
        $liveWorkspaces = $this->workspaceRepository->countLive();

        $usersDeleted = $this->userRepository->countDeletedSince($since);
        $usersDeleted30d = $windowDays === 30
            ? $usersDeleted
            : $this->userRepository->countDeletedSince($since30d);
        $liveUsers = $this->userRepository->countLive();

        $events = $this->buildEvents($since);
        $lifetimes = array_values(array_filter(
            array_column($events, 'lifetimeDays'),
            static fn (?int $days) => $days !== null,
        ));

        $total = count($events);
        $offset = ($page - 1) * self::EVENT_PAGE_SIZE;

        return [
            'windowDays' => $windowDays,
            'summary' => [
                'paidChurned' => $paidChurned,
                'paidChurnedLast30d' => $paidChurned30d,
                'livePaid' => $livePaid,
                'paidChurnRate' => $this->rate($paidChurned, $livePaid + $paidChurned),
                'paidChurnRateLast30d' => $this->rate($paidChurned30d, $livePaid + $paidChurned30d),
                'workspacesDeleted' => $workspacesDeleted,
                'workspacesDeletedLast30d' => $workspacesDeleted30d,
                'liveWorkspaces' => $liveWorkspaces,
                'workspaceChurnRate' => $this->rate($workspacesDeleted, $liveWorkspaces + $workspacesDeleted),
                'usersDeleted' => $usersDeleted,
                'usersDeletedLast30d' => $usersDeleted30d,
                'liveUsers' => $liveUsers,
                'userChurnRate' => $this->rate($usersDeleted, $liveUsers + $usersDeleted),
                'avgLifetimeDays' => $lifetimes === []
                    ? null
                    : (int) round(array_sum($lifetimes) / count($lifetimes)),
            ],
            'series' => $this->buildSeries(),
            'events' => [
                'items' => array_slice($events, $offset, self::EVENT_PAGE_SIZE),
                'page' => $page,
                'pageSize' => self::EVENT_PAGE_SIZE,
                'total' => $total,
            ],
            'dormant' => $this->buildDormant(),
            'dormantAfterDays' => self::DORMANT_AFTER_DAYS,
        ];
    }

    /**
     * Cancellations, workspace deletions and account deletions merged into one
     * newest-first timeline, with deletions winning whenever a workspace
     * produced both.
     *
     * @return array<int, array<string, mixed>>
     */
    private function buildEvents(\DateTimeInterface $since): array
    {
        /** @var Workspace[] $deletedWorkspaces */
        $deletedWorkspaces = $this->workspaceRepository->findDeletedSince($since);
        $subscriptionsByWorkspace = $this->subscriptionRepository->findByWorkspaces($deletedWorkspaces);

        $events = [];
        $deletedWorkspaceIds = [];
        $ownersOfDeletedWorkspaces = [];

        foreach ($deletedWorkspaces as $workspace) {
            $deletedAt = $workspace->getDeletedAt();
            if ($deletedAt === null) {
                continue;
            }
            $deletedWorkspaceIds[$workspace->getPublicId()] = true;
            $owner = $workspace->getOwner();
            if ($owner !== null) {
                $ownersOfDeletedWorkspaces[(string) $owner->getPublicId()] = true;
            }
            $subscription = $subscriptionsByWorkspace[$workspace->getPublicId()] ?? null;
            $plan = $subscription?->getPlan()->value;

            $events[] = [
                'id' => 'ws-'.$workspace->getPublicId(),
                'type' => 'workspace_deleted',
                'occurredAt' => $deletedAt->format('c'),
                'workspace' => [
                    'publicId' => (string) $workspace->getPublicId(),
                    'name' => $workspace->getName(),
                ],
                'owner' => $owner ? [
                    'publicId' => (string) $owner->getPublicId(),
                    'email' => $this->displayEmail($owner->getEmail()),
                ] : null,
                'plan' => $plan,
                'wasPaid' => $plan !== null && $plan !== 'free',
                'paddleSubscriptionId' => $subscription?->getPaddleSubscriptionId(),
                'lifetimeDays' => $this->lifetimeDays($workspace, $deletedAt),
            ];
        }

        /** @var Subscription[] $canceled */
        $canceled = $this->subscriptionRepository->findPaidCanceledSince($since);
        foreach ($canceled as $subscription) {
            $canceledAt = $subscription->getCanceledAt();
            $workspace = $subscription->getWorkspace();
            // The workspace's deletion already represents this churn.
            if ($canceledAt === null || isset($deletedWorkspaceIds[$workspace->getPublicId()])) {
                continue;
            }

            $events[] = [
                'id' => 'sub-'.$subscription->getPublicId(),
                'type' => 'subscription_canceled',
                'occurredAt' => $canceledAt->format('c'),
                'workspace' => [
                    'publicId' => (string) $workspace->getPublicId(),
                    'name' => $workspace->getName(),
                ],
                'owner' => $workspace->getOwner() ? [
                    'publicId' => (string) $workspace->getOwner()->getPublicId(),
                    'email' => $this->displayEmail($workspace->getOwner()->getEmail()),
                ] : null,
                'plan' => $subscription->getPlan()->value,
                'wasPaid' => true,
                'paddleSubscriptionId' => $subscription->getPaddleSubscriptionId(),
                'lifetimeDays' => $this->lifetimeDays($workspace, $canceledAt),
            ];
        }

        /** @var User[] $deletedUsers */
        $deletedUsers = $this->userRepository->findDeletedSince($since);
        foreach ($deletedUsers as $user) {
            $deletedAt = $user->getDeletedAt();
            // An owner's account deletion cascades to their workspaces, and that
            // deletion is the louder signal — don't report the same churn twice.
            if ($deletedAt === null || isset($ownersOfDeletedWorkspaces[(string) $user->getPublicId()])) {
                continue;
            }

            $events[] = [
                'id' => 'user-'.$user->getPublicId(),
                'type' => 'user_deleted',
                'occurredAt' => $deletedAt->format('c'),
                // Nothing to link to: the account may never have owned a workspace
                // (employees and managers churn too), and any it did own is gone.
                'workspace' => null,
                'owner' => [
                    'publicId' => (string) $user->getPublicId(),
                    'email' => $this->displayEmail($user->getEmail()),
                ],
                'plan' => null,
                'wasPaid' => false,
                'paddleSubscriptionId' => null,
                'lifetimeDays' => max(0, (int) $user->getCreatedAt()->diff($deletedAt)->days),
            ];
        }

        usort($events, static fn (array $a, array $b) => strcmp((string) $b['occurredAt'], (string) $a['occurredAt']));

        return $events;
    }

    /**
     * Account deletion frees the unique email by suffixing it (`_deleted_12_170…`,
     * see AccountDeletionService). Admins need to recognise who churned, so show
     * the address they signed up with.
     */
    private function displayEmail(?string $email): ?string
    {
        if ($email === null) {
            return null;
        }

        return preg_replace('/_deleted_\d+_\d+$/', '', $email);
    }

    /**
     * The churn block on the admin dashboard: the same 12-month trend the churn page draws, plus
     * the 30-day headline. Deliberately narrower than build() — no timeline, no at-risk list, so
     * the dashboard stays four cheap queries rather than pulling a page's worth of rows it would
     * only throw away.
     *
     * @return array<string, mixed>
     */
    public function dashboardSummary(): array
    {
        $since30d = DateService::relative('-30 days');

        $paidChurned30d = $this->subscriptionRepository->countPaidCanceledSince($since30d);
        $livePaid = $this->subscriptionRepository->countLivePaid();

        return [
            'series' => $this->buildSeries(),
            'paidCanceledLast30d' => $paidChurned30d,
            'workspacesDeletedLast30d' => $this->workspaceRepository->countDeletedSince($since30d),
            'usersDeletedLast30d' => $this->userRepository->countDeletedSince($since30d),
            'livePaid' => $livePaid,
            // Same denominator as the churn page: churned ÷ (churned + still live). There is no
            // historical subscription snapshot to use as a true period-start count, and inventing
            // one here would make the dashboard disagree with /admin/churn.
            'paidChurnRateLast30d' => $this->rate($paidChurned30d, $livePaid + $paidChurned30d),
        ];
    }

    /**
     * Last 12 calendar months, zero-filled, oldest first.
     *
     * @return array<int, array{month: string, paidCanceled: int, workspacesDeleted: int, usersDeleted: int}>
     */
    private function buildSeries(): array
    {
        $firstOfThisMonth = DateService::parse(DateService::now()->format('Y-m-01'));
        $seriesSince = $firstOfThisMonth->modify(sprintf('-%d months', self::SERIES_MONTHS - 1));

        $canceledByMonth = $this->subscriptionRepository->countPaidCanceledByMonthSince($seriesSince);
        $deletedByMonth = $this->workspaceRepository->countDeletedByMonthSince($seriesSince);
        $usersDeletedByMonth = $this->userRepository->countDeletedByMonthSince($seriesSince);

        $series = [];
        $cursor = $seriesSince;
        for ($i = 0; $i < self::SERIES_MONTHS; $i++) {
            $month = $cursor->format('Y-m');
            $series[] = [
                'month' => $month,
                'paidCanceled' => $canceledByMonth[$month] ?? 0,
                'workspacesDeleted' => $deletedByMonth[$month] ?? 0,
                'usersDeleted' => $usersDeletedByMonth[$month] ?? 0,
            ];
            $cursor = $cursor->modify('+1 month');
        }

        return $series;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildDormant(): array
    {
        $cutoff = DateService::relative(sprintf('-%d days', self::DORMANT_AFTER_DAYS));
        $rows = $this->workspaceRepository->findDormantPaidWorkspaces($cutoff, self::DORMANT_LIMIT);
        $today = DateService::now();

        return array_map(static function (array $row) use ($today): array {
            $last = DateService::parse($row['lastActivity']);
            $daysQuiet = (int) $last->diff($today)->days;

            return [
                'publicId' => $row['publicId'],
                'name' => $row['name'],
                'ownerEmail' => $row['ownerEmail'],
                'plan' => $row['plan'],
                'lastActivity' => $row['lastActivity'],
                'daysQuiet' => $daysQuiet,
            ];
        }, $rows);
    }

    private function lifetimeDays(Workspace $workspace, \DateTimeInterface $churnedAt): int
    {
        $createdAt = $workspace->getCreatedAt();
        $days = (int) $createdAt->diff($churnedAt)->days;

        return max(0, $days);
    }

    /** Percentage with one decimal; an empty denominator is 0.0, not a division by zero. */
    private function rate(int $numerator, int $denominator): float
    {
        if ($denominator <= 0) {
            return 0.0;
        }

        return round(($numerator / $denominator) * 100, 1);
    }
}

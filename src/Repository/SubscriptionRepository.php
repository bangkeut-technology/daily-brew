<?php

namespace App\Repository;

use App\Entity\Subscription;
use App\Entity\Workspace;
use App\Enum\PlanEnum;
use App\Enum\SubscriptionStatusEnum;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

class SubscriptionRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Subscription::class);
    }

    public function findByWorkspace(Workspace $workspace): ?Subscription
    {
        return $this->findOneBy(['workspace' => $workspace]);
    }

    public function findByPaddleSubscriptionId(string $paddleSubscriptionId): ?Subscription
    {
        return $this->findOneBy(['paddleSubscriptionId' => $paddleSubscriptionId]);
    }

    /**
     * Paid subscriptions that stopped paying since a given moment — the churn
     * numerator. Free rows are excluded: a canceled free "subscription" is a
     * bookkeeping tombstone, not lost revenue.
     */
    public function countPaidCanceledSince(\DateTimeInterface $since): int
    {
        return (int) $this->paidCanceledSince($since)
            ->select('COUNT(s.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * The churn denominator's live half: subscriptions currently granting a paid
     * plan. Mirrors the admin dashboard's "active plans" definition — past_due
     * and paused don't grant the plan, so they don't count as retained either.
     */
    public function countLivePaid(): int
    {
        return (int) $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->where('s.plan != :free')
            ->andWhere('s.status IN (:live)')
            ->setParameter('free', PlanEnum::Free)
            ->setParameter('live', [SubscriptionStatusEnum::Active, SubscriptionStatusEnum::Trialing])
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Churned paid subscriptions with workspace + owner hydrated, newest first.
     * Bounded — the churn timeline is a recent-history view, not an export.
     *
     * @return Subscription[]
     */
    public function findPaidCanceledSince(\DateTimeInterface $since, int $limit = 500): array
    {
        return $this->paidCanceledSince($since)
            ->leftJoin('s.workspace', 'w')->addSelect('w')
            ->leftJoin('w.owner', 'o')->addSelect('o')
            ->orderBy('s.canceledAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Paid cancellations bucketed by calendar month (`YYYY-MM`) of the
     * cancellation date. Months with no churn are absent — callers zero-fill.
     *
     * @return array<string, int>
     */
    public function countPaidCanceledByMonthSince(\DateTimeInterface $since): array
    {
        /** @var array<int, array{month: string|null, c: int|string}> $rows */
        $rows = $this->paidCanceledSince($since)
            ->select('SUBSTRING(s.canceledAt, 1, 7) AS month, COUNT(s.id) AS c')
            ->groupBy('month')
            ->getQuery()
            ->getArrayResult();

        $out = [];
        foreach ($rows as $row) {
            $month = (string) ($row['month'] ?? '');
            if ($month !== '') {
                $out[$month] = (int) $row['c'];
            }
        }

        return $out;
    }

    /**
     * Subscriptions for the given workspaces, keyed by workspace public id —
     * one query instead of one per row when decorating a list of workspaces
     * with their plan.
     *
     * @param Workspace[] $workspaces
     *
     * @return array<string, Subscription>
     */
    public function findByWorkspaces(array $workspaces): array
    {
        if ($workspaces === []) {
            return [];
        }

        /** @var Subscription[] $subscriptions */
        $subscriptions = $this->createQueryBuilder('s')
            ->where('s.workspace IN (:workspaces)')
            ->setParameter('workspaces', $workspaces)
            ->getQuery()
            ->getResult();

        $out = [];
        foreach ($subscriptions as $subscription) {
            $out[$subscription->getWorkspace()->getPublicId()] = $subscription;
        }

        return $out;
    }

    /**
     * Rows that carry a cancellation date but don't say canceled — the shape a late Paddle status
     * webhook used to produce by overwriting the status of an already-cancelled subscription.
     *
     * @return Subscription[]
     */
    public function findCanceledWithDriftedStatus(): array
    {
        return $this->createQueryBuilder('s')
            ->leftJoin('s.workspace', 'w')->addSelect('w')
            ->leftJoin('w.owner', 'o')->addSelect('o')
            ->where('s.canceledAt IS NOT NULL')
            ->andWhere('s.status != :canceled')
            ->setParameter('canceled', SubscriptionStatusEnum::Canceled)
            ->orderBy('s.canceledAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Live subscriptions belonging to a deleted workspace. Until workspace deletion learned to
     * cancel anything that wasn't active|trialing, a past_due or paused subscription survived the
     * deletion — still billable at Paddle, attached to an account that no longer exists.
     *
     * @return Subscription[]
     */
    public function findLiveForDeletedWorkspaces(): array
    {
        return $this->createQueryBuilder('s')
            ->innerJoin('s.workspace', 'w')->addSelect('w')
            ->leftJoin('w.owner', 'o')->addSelect('o')
            ->where('w.deletedAt IS NOT NULL')
            ->andWhere('s.status != :canceled')
            ->setParameter('canceled', SubscriptionStatusEnum::Canceled)
            ->orderBy('w.deletedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    private function paidCanceledSince(\DateTimeInterface $since): QueryBuilder
    {
        return $this->createQueryBuilder('s')
            ->where('s.plan != :free')
            ->andWhere('s.canceledAt IS NOT NULL')
            ->andWhere('s.canceledAt >= :since')
            ->setParameter('free', PlanEnum::Free)
            ->setParameter('since', $since);
    }
}

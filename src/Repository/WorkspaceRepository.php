<?php

namespace App\Repository;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Subscription;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\PlanEnum;
use App\Enum\SubscriptionStatusEnum;
use Doctrine\Persistence\ManagerRegistry;

class WorkspaceRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Workspace::class, 12);
    }

    public function findByQrToken(string $qrToken): ?Workspace
    {
        return $this->findOneBy(['qrToken' => $qrToken]);
    }

    /**
     * Live (not soft-deleted) workspaces owned by the user — the default for
     * everything user-facing (workspace switcher, settings, plan checks, etc.).
     *
     * @return Workspace[]
     */
    public function findByOwner(User $owner): array
    {
        return $this->createQueryBuilder('w')
            ->where('w.owner = :owner')
            ->andWhere('w.deletedAt IS NULL')
            ->setParameter('owner', $owner)
            ->orderBy('w.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Every workspace this user has ever owned, including soft-deleted ones.
     * Used by the admin user-detail panel so support staff can see deletion
     * history; not appropriate for ordinary console views.
     *
     * @return Workspace[]
     */
    public function findAllByOwnerIncludingDeleted(User $owner): array
    {
        return $this->findBy(['owner' => $owner], ['createdAt' => 'DESC']);
    }

    /** Live workspaces — the retained half of the workspace churn denominator. */
    public function countLive(): int
    {
        return $this->count(['deletedAt' => null]);
    }

    public function countDeletedSince(\DateTimeInterface $since): int
    {
        return (int) $this->createQueryBuilder('w')
            ->select('COUNT(w.id)')
            ->where('w.deletedAt IS NOT NULL')
            ->andWhere('w.deletedAt >= :since')
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Soft-deleted workspaces with their owner hydrated, newest deletion first.
     * Bounded — the churn timeline shows recent history, not the whole archive.
     *
     * @return Workspace[]
     */
    public function findDeletedSince(\DateTimeInterface $since, int $limit = 500): array
    {
        return $this->createQueryBuilder('w')
            ->leftJoin('w.owner', 'o')->addSelect('o')
            ->where('w.deletedAt IS NOT NULL')
            ->andWhere('w.deletedAt >= :since')
            ->setParameter('since', $since)
            ->orderBy('w.deletedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Deletions bucketed by calendar month (`YYYY-MM`). Months with no deletion
     * are absent — callers zero-fill.
     *
     * @return array<string, int>
     */
    public function countDeletedByMonthSince(\DateTimeInterface $since): array
    {
        /** @var array<int, array{month: string|null, c: int|string}> $rows */
        $rows = $this->createQueryBuilder('w')
            ->select('SUBSTRING(w.deletedAt, 1, 7) AS month, COUNT(w.id) AS c')
            ->where('w.deletedAt IS NOT NULL')
            ->andWhere('w.deletedAt >= :since')
            ->setParameter('since', $since)
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
     * Paying workspaces that have gone quiet — nobody has checked in since the
     * cutoff, though they did at some point. This is the leading indicator: a
     * paid account with no attendance for three weeks usually cancels next.
     *
     * Workspaces that never recorded a check-in are excluded (that's an
     * activation problem, and the dashboard funnel already tracks it).
     *
     * @return array<int, array{publicId: string, name: string, ownerEmail: string|null, plan: string, lastActivity: string}>
     */
    public function findDormantPaidWorkspaces(\DateTimeInterface $cutoff, int $limit = 12): array
    {
        /** @var array<int, array{publicId: string, name: string, ownerEmail: string|null, plan: mixed, lastActivity: mixed}> $rows */
        $rows = $this->createQueryBuilder('w')
            ->select('w.publicId AS publicId, w.name AS name, o.email AS ownerEmail, s.plan AS plan, MAX(a.date) AS lastActivity')
            ->leftJoin('w.owner', 'o')
            ->join(Subscription::class, 's', 'WITH', 's.workspace = w')
            ->join(Employee::class, 'e', 'WITH', 'e.workspace = w AND e.deletedAt IS NULL')
            ->join(Attendance::class, 'a', 'WITH', 'a.employee = e AND a.checkInAt IS NOT NULL AND a.voidedAt IS NULL')
            ->where('w.deletedAt IS NULL')
            ->andWhere('s.plan != :free')
            ->andWhere('s.status IN (:live)')
            ->groupBy('w.id, w.publicId, w.name, o.email, s.plan')
            ->having('MAX(a.date) < :cutoff')
            ->setParameter('free', PlanEnum::Free)
            ->setParameter('live', [SubscriptionStatusEnum::Active, SubscriptionStatusEnum::Trialing])
            ->setParameter('cutoff', $cutoff)
            ->orderBy('lastActivity', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getArrayResult();

        return array_map(static function (array $row): array {
            $lastActivity = $row['lastActivity'];
            $plan = $row['plan'];

            return [
                'publicId' => (string) $row['publicId'],
                'name' => (string) $row['name'],
                'ownerEmail' => $row['ownerEmail'] !== null ? (string) $row['ownerEmail'] : null,
                'plan' => $plan instanceof PlanEnum ? $plan->value : (string) $plan,
                // MAX() on a date_immutable column comes back driver-shaped —
                // normalise either a DateTime or a raw string to Y-m-d.
                'lastActivity' => $lastActivity instanceof \DateTimeInterface
                    ? $lastActivity->format('Y-m-d')
                    : substr((string) $lastActivity, 0, 10),
            ];
        }, $rows);
    }
}

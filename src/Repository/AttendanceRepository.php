<?php

namespace App\Repository;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Workspace;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractRepository<Attendance>
 */
class AttendanceRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Attendance::class);
    }

    public function findByEmployeeAndDate(Employee $employee, \DateTimeInterface $date): ?Attendance
    {
        return $this->findOneBy(['employee' => $employee, 'date' => $date]);
    }

    /**
     * Recent attendance feed for the dashboard. Voided rows are excluded — a
     * soft-deleted row shouldn't reappear in "happening now."
     *
     * @return Attendance[]
     */
    public function findByWorkspaceAndDate(Workspace $workspace, \DateTimeInterface $date): array
    {
        return $this->createQueryBuilder('a')
            ->join('a.employee', 'e')
            ->where('e.workspace = :workspace')
            ->andWhere('a.date = :date')
            ->andWhere('a.voidedAt IS NULL')
            ->setParameter('workspace', $workspace)
            ->setParameter('date', $date)
            ->orderBy('a.checkInAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByWorkspaceAndDateRange(Workspace $workspace, \DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return $this->createQueryBuilder('a')
            ->join('a.employee', 'e')
            ->where('e.workspace = :workspace')
            ->andWhere('a.date >= :from')
            ->andWhere('a.date <= :to')
            ->setParameter('workspace', $workspace)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('a.date', 'DESC')
            ->addOrderBy('a.checkInAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Last day anyone checked in, per workspace — the single best "is this
     * account alive?" signal for the admin workspace list. Batched so a page of
     * 25 rows costs one query instead of 25.
     *
     * Joins through employee.workspace rather than the (nullable) direct
     * Attendance.workspace column, matching the other counts in this class.
     *
     * @param int[] $workspaceIds
     * @return array<int, string> workspaceId => 'Y-m-d'
     */
    public function findLastAttendanceDateByWorkspaceIds(array $workspaceIds): array
    {
        if (empty($workspaceIds)) {
            return [];
        }

        /** @var array<int, array{wid: int, d: mixed}> $rows */
        $rows = $this->createQueryBuilder('a')
            ->select('IDENTITY(e.workspace) AS wid, MAX(a.date) AS d')
            ->join('a.employee', 'e')
            ->where('IDENTITY(e.workspace) IN (:ids)')
            ->andWhere('a.checkInAt IS NOT NULL')
            ->andWhere('a.voidedAt IS NULL')
            ->setParameter('ids', $workspaceIds)
            ->groupBy('e.workspace')
            ->getQuery()
            ->getArrayResult();

        $out = [];
        foreach ($rows as $row) {
            $value = $row['d'];
            if ($value === null) {
                continue;
            }
            // MAX() on a date_immutable column comes back as a driver-level
            // string, not a DateTime — normalise either shape to Y-m-d.
            $out[(int) $row['wid']] = $value instanceof \DateTimeInterface
                ? $value->format('Y-m-d')
                : substr((string) $value, 0, 10);
        }

        return $out;
    }

    /** Real check-ins in this workspace, optionally only since a given day. */
    public function countByWorkspace(Workspace $workspace, ?\DateTimeInterface $since = null): int
    {
        $qb = $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->join('a.employee', 'e')
            ->where('e.workspace = :workspace')
            ->andWhere('a.checkInAt IS NOT NULL')
            ->andWhere('a.voidedAt IS NULL')
            ->setParameter('workspace', $workspace);

        if ($since !== null) {
            $qb->andWhere('a.date >= :since')->setParameter('since', $since);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * How many live workspaces have ever recorded a check-in — optionally
     * narrowed to those active since a given day. Powers the admin dashboard's
     * activation funnel.
     */
    public function countWorkspacesWithAttendance(?\DateTimeInterface $since = null): int
    {
        $qb = $this->createQueryBuilder('a')
            ->select('COUNT(DISTINCT IDENTITY(e.workspace))')
            ->join('a.employee', 'e')
            ->join('e.workspace', 'w')
            ->where('w.deletedAt IS NULL')
            ->andWhere('a.checkInAt IS NOT NULL')
            ->andWhere('a.voidedAt IS NULL');

        if ($since !== null) {
            $qb->andWhere('a.date >= :since')->setParameter('since', $since);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /** Voided rows are excluded so the dashboard's "absent" baseline rises again when a row is deleted. */
    public function countByWorkspaceAndDate(Workspace $workspace, \DateTimeInterface $date): int
    {
        return (int) $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->join('a.employee', 'e')
            ->where('e.workspace = :workspace')
            ->andWhere('a.date = :date')
            ->andWhere('a.checkInAt IS NOT NULL')
            ->andWhere('a.voidedAt IS NULL')
            ->setParameter('workspace', $workspace)
            ->setParameter('date', $date)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countLateByWorkspaceAndDate(Workspace $workspace, \DateTimeInterface $date): int
    {
        return (int) $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->join('a.employee', 'e')
            ->where('e.workspace = :workspace')
            ->andWhere('a.date = :date')
            ->andWhere('a.isLate = true')
            ->andWhere('a.voidedAt IS NULL')
            ->setParameter('workspace', $workspace)
            ->setParameter('date', $date)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Find an attendance record for a different employee on the same day
     * using the same device ID (within the same workspace).
     */
    public function findByDeviceIdAndDateExcludingEmployee(
        Workspace $workspace,
        string $deviceId,
        \DateTimeInterface $date,
        Employee $excludeEmployee,
    ): ?Attendance {
        return $this->createQueryBuilder('a')
            ->where('a.workspace = :workspace')
            ->andWhere('a.date = :date')
            ->andWhere('a.checkInDeviceId = :deviceId')
            ->andWhere('a.employee != :employee')
            ->setParameter('workspace', $workspace)
            ->setParameter('date', $date)
            ->setParameter('deviceId', $deviceId)
            ->setParameter('employee', $excludeEmployee)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** @return Attendance[] */
    public function findByEmployee(Employee $employee, int $limit = 30): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.employee = :employee')
            ->setParameter('employee', $employee)
            ->orderBy('a.date', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Distinct check-in and check-out device IDs ever recorded for an employee.
     * Used to decide whether a clock-in device is new. Optionally excludes one
     * attendance row (e.g. the record just created) so it isn't its own baseline.
     *
     * @return string[]
     */
    public function findKnownDeviceIds(Employee $employee, ?int $excludeAttendanceId = null): array
    {
        $qb = $this->createQueryBuilder('a')
            ->select('a.checkInDeviceId AS ci', 'a.checkOutDeviceId AS co')
            ->where('a.employee = :employee')
            ->setParameter('employee', $employee);

        if ($excludeAttendanceId !== null) {
            $qb->andWhere('a.id != :excludeId')->setParameter('excludeId', $excludeAttendanceId);
        }

        $ids = [];
        foreach ($qb->getQuery()->getScalarResult() as $row) {
            if (!empty($row['ci'])) {
                $ids[] = $row['ci'];
            }
            if (!empty($row['co'])) {
                $ids[] = $row['co'];
            }
        }

        return array_values(array_unique($ids));
    }
}

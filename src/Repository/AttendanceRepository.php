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

    /** @return Attendance[] */
    public function findByWorkspaceAndDate(Workspace $workspace, \DateTimeInterface $date): array
    {
        return $this->createQueryBuilder('a')
            ->join('a.employee', 'e')
            ->where('e.workspace = :workspace')
            ->andWhere('a.date = :date')
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

    public function countByWorkspaceAndDate(Workspace $workspace, \DateTimeInterface $date): int
    {
        return (int) $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->join('a.employee', 'e')
            ->where('e.workspace = :workspace')
            ->andWhere('a.date = :date')
            ->andWhere('a.checkInAt IS NOT NULL')
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
}

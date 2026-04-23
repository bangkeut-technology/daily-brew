<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\LeaveRequestStatusEnum;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractRepository<LeaveRequest>
 */
class LeaveRequestRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LeaveRequest::class);
    }

    /** @return LeaveRequest[] */
    public function findByWorkspace(Workspace $workspace, ?LeaveRequestStatusEnum $status = null): array
    {
        $qb = $this->createQueryBuilder('lr')
            ->where('lr.workspace = :workspace')
            ->andWhere('lr.deletedAt IS NULL')
            ->setParameter('workspace', $workspace)
            ->orderBy('lr.createdAt', 'DESC');

        if ($status !== null) {
            $qb->andWhere('lr.status = :status')
                ->setParameter('status', $status);
        }

        return $qb->getQuery()->getResult();
    }

    public function countPendingByWorkspace(Workspace $workspace): int
    {
        return (int) $this->createQueryBuilder('lr')
            ->select('COUNT(lr.id)')
            ->where('lr.workspace = :workspace')
            ->andWhere('lr.status = :status')
            ->andWhere('lr.deletedAt IS NULL')
            ->setParameter('workspace', $workspace)
            ->setParameter('status', LeaveRequestStatusEnum::PENDING)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Count approved leave requests that overlap a given date.
     */
    public function countApprovedByWorkspaceAndDate(Workspace $workspace, \DateTimeInterface $date): int
    {
        return (int) $this->createQueryBuilder('lr')
            ->select('COUNT(lr.id)')
            ->where('lr.workspace = :workspace')
            ->andWhere('lr.startDate <= :date')
            ->andWhere('lr.endDate >= :date')
            ->andWhere('lr.status = :status')
            ->andWhere('lr.deletedAt IS NULL')
            ->setParameter('workspace', $workspace)
            ->setParameter('date', $date)
            ->setParameter('status', LeaveRequestStatusEnum::APPROVED)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /** @return LeaveRequest[] */
    public function findApprovedInRange(Employee $employee, \DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return $this->createQueryBuilder('lr')
            ->where('lr.employee = :employee')
            ->andWhere('lr.startDate <= :to')
            ->andWhere('lr.endDate >= :from')
            ->andWhere('lr.status = :status')
            ->andWhere('lr.deletedAt IS NULL')
            ->setParameter('employee', $employee)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->setParameter('status', LeaveRequestStatusEnum::APPROVED)
            ->getQuery()
            ->getResult();
    }

    public function findApprovedForEmployeeOnDate(Employee $employee, \DateTimeInterface $date): ?LeaveRequest
    {
        return $this->createQueryBuilder('lr')
            ->where('lr.employee = :employee')
            ->andWhere('lr.startDate <= :date')
            ->andWhere('lr.endDate >= :date')
            ->andWhere('lr.status = :status')
            ->andWhere('lr.deletedAt IS NULL')
            ->setParameter('employee', $employee)
            ->setParameter('date', $date)
            ->setParameter('status', LeaveRequestStatusEnum::APPROVED)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findOverlappingForEmployee(Employee $employee, \DateTimeInterface $startDate, \DateTimeInterface $endDate): ?LeaveRequest
    {
        return $this->createQueryBuilder('lr')
            ->where('lr.employee = :employee')
            ->andWhere('lr.startDate <= :endDate')
            ->andWhere('lr.endDate >= :startDate')
            ->andWhere('lr.status != :rejected')
            ->andWhere('lr.deletedAt IS NULL')
            ->setParameter('employee', $employee)
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->setParameter('rejected', LeaveRequestStatusEnum::REJECTED)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** @return LeaveRequest[] */
    public function findApprovedByWorkspaceAndDateRange(Workspace $workspace, \DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return $this->createQueryBuilder('lr')
            ->where('lr.workspace = :workspace')
            ->andWhere('lr.startDate <= :to')
            ->andWhere('lr.endDate >= :from')
            ->andWhere('lr.status = :status')
            ->andWhere('lr.deletedAt IS NULL')
            ->setParameter('workspace', $workspace)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->setParameter('status', LeaveRequestStatusEnum::APPROVED)
            ->getQuery()
            ->getResult();
    }

    /** Soft-delete all leave requests made by the given user. */
    public function softDeleteByRequestedBy(User $user, \DateTimeImmutable $deletedAt): void
    {
        $this->createQueryBuilder('lr')
            ->update()
            ->set('lr.deletedAt', ':now')
            ->where('lr.requestedBy = :user')
            ->andWhere('lr.deletedAt IS NULL')
            ->setParameter('now', $deletedAt)
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }
}

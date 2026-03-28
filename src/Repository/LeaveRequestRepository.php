<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\LeaveRequest;
use App\Entity\Workspace;
use App\Enum\LeaveRequestStatusEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LeaveRequest>
 */
class LeaveRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LeaveRequest::class);
    }

    public function findByPublicId(string $publicId): ?LeaveRequest
    {
        return $this->findOneBy(['publicId' => $publicId]);
    }

    /** @return LeaveRequest[] */
    public function findByWorkspace(Workspace $workspace, ?LeaveRequestStatusEnum $status = null): array
    {
        $qb = $this->createQueryBuilder('lr')
            ->where('lr.workspace = :workspace')
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
            ->setParameter('workspace', $workspace)
            ->setParameter('date', $date)
            ->setParameter('status', LeaveRequestStatusEnum::APPROVED)
            ->getQuery()
            ->getSingleScalarResult();
    }
}

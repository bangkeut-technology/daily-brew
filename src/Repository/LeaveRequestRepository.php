<?php

namespace App\Repository;

use App\Entity\LeaveRequest;
use App\Entity\Workspace;
use App\Enum\LeaveRequestStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

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
    public function findByWorkspace(Workspace $workspace, ?LeaveRequestStatus $status = null): array
    {
        $qb = $this->createQueryBuilder('lr')
            ->join('lr.employee', 'e')
            ->where('e.workspace = :workspace')
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
            ->join('lr.employee', 'e')
            ->where('e.workspace = :workspace')
            ->andWhere('lr.status = :status')
            ->setParameter('workspace', $workspace)
            ->setParameter('status', LeaveRequestStatus::Pending)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countApprovedByWorkspaceAndDate(Workspace $workspace, \DateTimeInterface $date): int
    {
        return (int) $this->createQueryBuilder('lr')
            ->select('COUNT(lr.id)')
            ->join('lr.employee', 'e')
            ->where('e.workspace = :workspace')
            ->andWhere('lr.date = :date')
            ->andWhere('lr.status = :status')
            ->setParameter('workspace', $workspace)
            ->setParameter('date', $date)
            ->setParameter('status', LeaveRequestStatus::Approved)
            ->getQuery()
            ->getSingleScalarResult();
    }
}

<?php

namespace App\Repository;

use App\Entity\ClosurePeriod;
use App\Entity\Workspace;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractRepository<ClosurePeriod>
 */
class ClosurePeriodRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ClosurePeriod::class);
    }

    /** @return ClosurePeriod[] */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->findBy(['workspace' => $workspace], ['startDate' => 'DESC']);
    }

    public function findOverlappingClosure(Workspace $workspace, \DateTimeInterface $startDate, \DateTimeInterface $endDate): ?ClosurePeriod
    {
        return $this->createQueryBuilder('c')
            ->where('c.workspace = :workspace')
            ->andWhere('c.startDate <= :endDate')
            ->andWhere('c.endDate >= :startDate')
            ->setParameter('workspace', $workspace)
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** @return ClosurePeriod[] */
    public function findAllOverlappingRange(Workspace $workspace, \DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.workspace = :workspace')
            ->andWhere('c.startDate <= :to')
            ->andWhere('c.endDate >= :from')
            ->setParameter('workspace', $workspace)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->getQuery()
            ->getResult();
    }

    public function findActiveOnDate(Workspace $workspace, \DateTimeInterface $date): ?ClosurePeriod
    {
        return $this->createQueryBuilder('c')
            ->where('c.workspace = :workspace')
            ->andWhere('c.startDate <= :date')
            ->andWhere('c.endDate >= :date')
            ->setParameter('workspace', $workspace)
            ->setParameter('date', $date)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}

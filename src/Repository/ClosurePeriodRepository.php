<?php

namespace App\Repository;

use App\Entity\ClosurePeriod;
use App\Entity\Workspace;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ClosurePeriodRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ClosurePeriod::class);
    }

    public function findByPublicId(string $publicId): ?ClosurePeriod
    {
        return $this->findOneBy(['publicId' => $publicId]);
    }

    /** @return ClosurePeriod[] */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->findBy(['workspace' => $workspace], ['startDate' => 'DESC']);
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

<?php

namespace App\Repository;

use App\Entity\Shift;
use App\Entity\Workspace;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ShiftRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Shift::class);
    }

    public function findByPublicId(string $publicId): ?Shift
    {
        return $this->findOneBy(['publicId' => $publicId]);
    }

    /** @return Shift[] */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->findBy(['workspace' => $workspace], ['name' => 'ASC']);
    }
}

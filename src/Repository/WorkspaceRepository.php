<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\Workspace;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class WorkspaceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Workspace::class);
    }

    public function findByPublicId(string $publicId): ?Workspace
    {
        return $this->findOneBy(['publicId' => $publicId]);
    }

    public function findByQrToken(string $qrToken): ?Workspace
    {
        return $this->findOneBy(['qrToken' => $qrToken]);
    }

    /** @return Workspace[] */
    public function findByOwner(User $owner): array
    {
        return $this->findBy(['owner' => $owner], ['createdAt' => 'DESC']);
    }
}

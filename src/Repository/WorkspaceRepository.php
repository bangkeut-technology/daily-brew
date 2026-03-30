<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\Workspace;
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

    /** @return Workspace[] */
    public function findByOwner(User $owner): array
    {
        return $this->findBy(['owner' => $owner], ['createdAt' => 'DESC']);
    }
}

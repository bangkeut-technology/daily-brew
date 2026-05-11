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

    /**
     * Live (not soft-deleted) workspaces owned by the user — the default for
     * everything user-facing (workspace switcher, settings, plan checks, etc.).
     *
     * @return Workspace[]
     */
    public function findByOwner(User $owner): array
    {
        return $this->createQueryBuilder('w')
            ->where('w.owner = :owner')
            ->andWhere('w.deletedAt IS NULL')
            ->setParameter('owner', $owner)
            ->orderBy('w.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Every workspace this user has ever owned, including soft-deleted ones.
     * Used by the admin user-detail panel so support staff can see deletion
     * history; not appropriate for ordinary console views.
     *
     * @return Workspace[]
     */
    public function findAllByOwnerIncludingDeleted(User $owner): array
    {
        return $this->findBy(['owner' => $owner], ['createdAt' => 'DESC']);
    }
}

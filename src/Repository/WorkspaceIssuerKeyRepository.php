<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Workspace;
use App\Entity\WorkspaceIssuerKey;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractRepository<WorkspaceIssuerKey>
 */
class WorkspaceIssuerKeyRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorkspaceIssuerKey::class);
    }

    /** The key new cards are signed with, or null before one has been minted. */
    public function findActiveForWorkspace(Workspace $workspace): ?WorkspaceIssuerKey
    {
        return $this->createQueryBuilder('k')
            ->where('k.workspace = :ws')
            ->andWhere('k.retiredAt IS NULL')
            ->setParameter('ws', $workspace)
            ->orderBy('k.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Every key a terminal should trust for this audience, newest first —
     * retired ones included, because cards signed with them are still in
     * people's pockets until they expire.
     *
     * @return array<int, WorkspaceIssuerKey>
     */
    public function findAllForWorkspacePublicId(string $workspacePublicId): array
    {
        return $this->createQueryBuilder('k')
            ->join('k.workspace', 'w')
            ->where('w.publicId = :ws')
            ->setParameter('ws', $workspacePublicId)
            ->orderBy('k.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}

<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Workspace;
use App\Entity\WorkspaceAllowedIp;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class WorkspaceAllowedIpRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends AbstractRepository<WorkspaceAllowedIp>
 *
 * @method WorkspaceAllowedIp      create()
 * @method WorkspaceAllowedIp|null find($id, $lockMode = null, $lockVersion = null)
 * @method WorkspaceAllowedIp|null findOneBy(array $criteria, array $orderBy = null)
 * @method WorkspaceAllowedIp|null findByPublicId(string $publicId)
 * @method WorkspaceAllowedIp[]    findAll()
 * @method WorkspaceAllowedIp[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class WorkspaceAllowedIpRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorkspaceAllowedIp::class);
    }

    /**
     * Find all active allowed IPs for a workspace.
     *
     * @param Workspace $workspace
     * @return WorkspaceAllowedIp[]
     */
    public function findActiveByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('w')
            ->where('w.workspace = :workspace')
            ->andWhere('w.isActive = :isActive')
            ->andWhere('w.deletedAt IS NULL')
            ->setParameter('workspace', $workspace)
            ->setParameter('isActive', true)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find an allowed IP by its public ID and workspace.
     *
     * @param string    $publicId
     * @param Workspace $workspace
     * @return WorkspaceAllowedIp|null
     */
    public function findByPublicIdAndWorkspace(string $publicId, Workspace $workspace): ?WorkspaceAllowedIp
    {
        return $this->findOneBy([
            'publicId' => $publicId,
            'workspace' => $workspace,
        ]);
    }
}

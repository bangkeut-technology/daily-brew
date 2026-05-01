<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Workspace;
use App\Entity\WorkspaceQrCode;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractRepository<WorkspaceQrCode>
 */
class WorkspaceQrCodeRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorkspaceQrCode::class, 12);
    }

    public function findByQrToken(string $qrToken): ?WorkspaceQrCode
    {
        return $this->findOneBy(['qrToken' => $qrToken]);
    }

    /** @return WorkspaceQrCode[] */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->findBy(['workspace' => $workspace], ['createdAt' => 'ASC']);
    }
}

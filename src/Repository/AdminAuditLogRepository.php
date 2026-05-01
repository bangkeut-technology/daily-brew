<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\AdminAuditLog;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractRepository<AdminAuditLog>
 */
class AdminAuditLogRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AdminAuditLog::class, 12);
    }
}

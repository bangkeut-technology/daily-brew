<?php

namespace App\Repository;

use App\Entity\WorkspaceSetting;
use Doctrine\Persistence\ManagerRegistry;

class WorkspaceSettingRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorkspaceSetting::class);
    }
}

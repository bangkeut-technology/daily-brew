<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class WorkspaceSettingRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends AbstractRepository<WorkspaceSetting>
 *
 * @method WorkspaceSetting      create()
 * @method WorkspaceSetting|null find($id, $lockMode = null, $lockVersion = null)
 * @method WorkspaceSetting|null findOneBy(array $criteria, array $orderBy = null)
 * @method WorkspaceSetting|null findByPublicId(string $publicId)
 * @method WorkspaceSetting[]    findAll()
 * @method WorkspaceSetting[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class WorkspaceSettingRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorkspaceSetting::class);
    }

    /**
     * Find all settings for a workspace.
     *
     * @param Workspace $workspace
     * @return WorkspaceSetting[]
     */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->findBy(['workspace' => $workspace]);
    }

    /**
     * Find a setting by name and workspace.
     *
     * @param string    $name
     * @param Workspace $workspace
     * @return WorkspaceSetting|null
     */
    public function findByNameAndWorkspace(string $name, Workspace $workspace): ?WorkspaceSetting
    {
        return $this->findOneBy(['name' => $name, 'workspace' => $workspace]);
    }

    /**
     * Find settings by multiple names and workspace.
     *
     * @param string[]  $names
     * @param Workspace $workspace
     * @return WorkspaceSetting[]
     */
    public function findByNamesAndWorkspace(array $names, Workspace $workspace): array
    {
        return $this->findBy(['name' => $names, 'workspace' => $workspace]);
    }
}

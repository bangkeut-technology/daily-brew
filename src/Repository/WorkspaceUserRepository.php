<?php
declare(strict_types=1);


namespace App\Repository;

use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceUser;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class WorkspaceUserRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<WorkspaceUser>
 *
 * @method WorkspaceUser      create()
 * @method WorkspaceUser|null find($id, $lockMode = null, $lockVersion = null)
 * @method WorkspaceUser|null findOneBy(array $criteria, array $orderBy = null)
 * @method WorkspaceUser|null findByPublicId(string $publicId)
 * @method WorkspaceUser[]    findAll()
 * @method WorkspaceUser[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class WorkspaceUserRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorkspaceUser::class);
    }

    /**
     * Find a workspace user by workspace and user.
     *
     * @param Workspace $workspace The workspace to search for.
     * @param User      $user      The user to search for.
     *
     * @return WorkspaceUser|null The found workspace user or null if not found.
     */
    public function findByWorkspaceAndUser(Workspace $workspace, User $user): ?WorkspaceUser
    {
        return $this->findOneBy(['workspace' => $workspace, 'user' => $user]);
    }
}

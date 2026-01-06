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
     * Find active WorkspaceUser entries by User
     *
     * @param User $user The user entity
     *
     * @return WorkspaceUser[] The list of active WorkspaceUser entries
     */
    public function findActiveByUser(User $user): array
    {
        return $this->createQueryBuilder('wu')
            ->andWhere('wu.user = :user')
            ->andWhere('wu.deletedAt IS NULL')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

    /**
     * Count active members in a workspace
     *
     * @param Workspace $workspace The workspace entity
     *
     * @return int The count of active members
     */
    public function countActiveMembers(Workspace $workspace): int
    {
        return $this->createQueryBuilder('wu')
            ->select('COUNT(wu.id)')
            ->andWhere('wu.workspace = :workspace')
            ->andWhere('wu.deletedAt IS NULL')
            ->setParameter('workspace', $workspace)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Find active membership for a workspace and user
     *
     * @param Workspace $workspace The workspace entity
     * @param User      $actor     The user entity
     *
     * @return WorkspaceUser|null
     */
    public function findActiveMembership(Workspace $workspace, User $actor): ?WorkspaceUser
    {
        return $this->findOneBy(['workspace' => $workspace, 'user' => $actor]);
    }

    /**
     * Count other active members in a workspace excluding the given actor
     *
     * @param Workspace $workspace The workspace entity
     * @param User      $actor     The user entity
     *
     * @return int The count of other active members
     */
    public function countOtherActiveMembers(Workspace $workspace, User $actor): int
    {
        return $this->createQueryBuilder('wu')
            ->select('COUNT(wu.id)')
            ->andWhere('wu.workspace = :workspace')
            ->andWhere('wu.user <> :actor')
            ->andWhere('wu.deletedAt IS NULL')
            ->setParameter('workspace', $workspace)
            ->setParameter('actor', $actor)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Check if a user is a member of a workspace
     *
     * @param Workspace $workspace The workspace entity
     * @param User      $user      The user entity
     *
     * @return bool True if the user is a member, false otherwise
     */
    public function isMember(Workspace $workspace, User $user): bool
    {
        return $this->createQueryBuilder('wu')
                ->select('COUNT(wu.id)')
                ->andWhere('wu.workspace = :workspace')
                ->andWhere('wu.user = :user')
                ->andWhere('wu.deletedAt IS NULL')
                ->setParameter('workspace', $workspace)
                ->setParameter('user', $user)
                ->getQuery()
                ->getSingleScalarResult() > 0;
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

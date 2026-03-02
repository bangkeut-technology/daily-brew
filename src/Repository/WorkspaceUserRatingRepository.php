<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceUserRating;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class WorkspaceUserRatingRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends AbstractRepository<WorkspaceUserRating>
 *
 * @method WorkspaceUserRating      create()
 * @method WorkspaceUserRating|null find($id, $lockMode = null, $lockVersion = null)
 * @method WorkspaceUserRating|null findOneBy(array $criteria, array $orderBy = null)
 * @method WorkspaceUserRating|null findByPublicId(string $publicId)
 * @method WorkspaceUserRating[]    findAll()
 * @method WorkspaceUserRating[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class WorkspaceUserRatingRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorkspaceUserRating::class);
    }

    /**
     * Find all ratings in a workspace.
     *
     * @param Workspace $workspace
     * @return WorkspaceUserRating[]
     */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.workspace = :workspace')
            ->andWhere('r.deletedAt IS NULL')
            ->setParameter('workspace', $workspace)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all ratings for a reviewee in a workspace.
     *
     * @param User      $user
     * @param Workspace $workspace
     * @return WorkspaceUserRating[]
     */
    public function findByReviewee(User $user, Workspace $workspace): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.reviewee = :user')
            ->andWhere('r.workspace = :workspace')
            ->andWhere('r.deletedAt IS NULL')
            ->setParameter('user', $user)
            ->setParameter('workspace', $workspace)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all ratings given by a reviewer in a workspace.
     *
     * @param User      $user
     * @param Workspace $workspace
     * @return WorkspaceUserRating[]
     */
    public function findByReviewer(User $user, Workspace $workspace): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.reviewer = :user')
            ->andWhere('r.workspace = :workspace')
            ->andWhere('r.deletedAt IS NULL')
            ->setParameter('user', $user)
            ->setParameter('workspace', $workspace)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find a rating by its public ID and workspace.
     *
     * @param string    $publicId
     * @param Workspace $workspace
     * @return WorkspaceUserRating|null
     */
    public function findByPublicIdAndWorkspace(string $publicId, Workspace $workspace): ?WorkspaceUserRating
    {
        return $this->findOneBy([
            'publicId' => $publicId,
            'workspace' => $workspace,
        ]);
    }
}

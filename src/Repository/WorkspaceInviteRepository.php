<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 1/6/26 8:14 AM
 *
 * @see     https://adora.media
 */

namespace App\Repository;

use App\Entity\WorkspaceInvite;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 *
 * Class WorkspaceInviteRepository
 *
 * @package App\Repository;
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<WorkspaceInvite>
 *
 * @method WorkspaceInvite      create()
 * @method WorkspaceInvite|null find($id, $lockMode = null, $lockVersion = null)
 * @method WorkspaceInvite|null findOneBy(array $criteria, array $orderBy = null)
 * @method WorkspaceInvite|null findByPublicId(string $publicId)
 * @method WorkspaceInvite[]    findAll()
 * @method WorkspaceInvite[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class WorkspaceInviteRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorkspaceInvite::class);
    }

    /**
     * Finds a WorkspaceInvite entity by its token.
     *
     * @param string $token The token to search for.
     *
     * @return WorkspaceInvite|null The found WorkspaceInvite entity or null if not found.
     */
    public function findByToken(string $token): ?WorkspaceInvite
    {
        return $this->findOneBy(['token' => $token]);
    }
}

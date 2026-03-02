<?php
declare(strict_types=1);


namespace App\Repository;

use App\Entity\User;
use App\Entity\Workspace;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class WorkspaceRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<Workspace>
 *
 * @method Workspace      create()
 * @method Workspace|null find($id, $lockMode = null, $lockVersion = null)
 * @method Workspace|null findOneBy(array $criteria, array $orderBy = null)
 * @method Workspace|null findByPublicId(string $publicId)
 * @method Workspace[]    findAll()
 * @method Workspace[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class WorkspaceRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Workspace::class);
    }

    /**
     * Find a workspace by its public ID and associated user.
     *
     * @param string $publicId The public ID of the workspace.
     * @param User   $user     The user associated with the workspace.
     *
     * @return Workspace|null The found workspace or null if not found.
     */
    public function findByPublicIdAndUser(string $publicId, User $user): ?Workspace
    {
        return $this->createQueryBuilder('w')
            ->innerJoin('w.users', 'u')
            ->where('w.publicId LIKE :publicId')
            ->andWhere('u.user = :user')
            ->andWhere('w.deletedAt IS NULL')
            ->setParameter('publicId', $publicId)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function inferWorkspaceForUser(User $user): ?Workspace
    {
        $em = $this->getEntityManager();

        // 1) From EvaluationTemplate
        $w = $em->createQueryBuilder()
            ->select('w')
            ->from(Workspace::class, 'w')
            ->innerJoin('w.evaluationTemplates', 't')
            ->andWhere('t.user = :user')
            ->andWhere('w.deletedAt IS NULL')
            ->setParameter('user', $user)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if ($w instanceof Workspace) {
            return $w;
        }

        // 2) From EvaluationCriteria
        $w = $em->createQueryBuilder()
            ->select('w')
            ->from(Workspace::class, 'w')
            ->innerJoin('w.evaluationCriterias', 'c')
            ->andWhere('c.user = :user')
            ->andWhere('w.deletedAt IS NULL')
            ->setParameter('user', $user)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        return $w instanceof Workspace ? $w : null;
    }
}

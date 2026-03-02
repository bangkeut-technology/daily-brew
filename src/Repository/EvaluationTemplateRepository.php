<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\EvaluationTemplate;
use App\Entity\User;
use App\Util\Canonicalizer;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Query\Parameter;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class EvaluationTemplateRepository.
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<EvaluationTemplate>
 *
 * @method EvaluationTemplate      create()
 * @method EvaluationTemplate|null find($id, $lockMode = null, $lockVersion = null)
 * @method EvaluationTemplate|null findOneBy(array $criteria, array $orderBy = null)
 * @method EvaluationTemplate|null findByPublicId(string $publicId)
 * @method EvaluationTemplate[]    findAll()
 * @method EvaluationTemplate[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EvaluationTemplateRepository extends AbstractRepository
{
    public function __construct(
        ManagerRegistry $registry,
    ) {
        parent::__construct($registry, EvaluationTemplate::class);
    }

    /**
     * Find an evaluation template by its publicId and user.
     *
     * @param string $publicId the publicId of the evaluation template
     * @param User   $user       the user associated with the evaluation template
     */
    public function findByPublicIdAndUser(string $publicId, User $user): ?EvaluationTemplate
    {
        return $this->createQueryBuilder('et')
            ->select('et, e, u, etc')
            ->innerJoin('et.user', 'u')
            ->leftJoin('et.employees', 'e')
            ->leftJoin('et.criterias', 'etc')
            ->where('et.publicId = :publicId')
            ->andWhere('et.user = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('publicId', $publicId),
                new Parameter('user', $user),
            ]))
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find all evaluation templates associated with a specific user.
     *
     * @param User $user the user whose evaluation templates to find
     *
     * @return EvaluationTemplate[] returns an array of EvaluationTemplate objects
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('et')
            ->where('et.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

    /**
     * Create a QueryBuilder to find evaluation templates by user.
     *
     * @param UserInterface|User|null $user the user whose evaluation templates to find
     *
     * @return QueryBuilder returns a QueryBuilder instance
     */
    public function findByUserQueryBuilder(UserInterface|User|null $user): QueryBuilder
    {
        return $this->createQueryBuilder('et')
            ->where('et.user = :user')
            ->setParameter('user', $user)
            ->orderBy('et.name', 'ASC');
    }

    /**
     * Find an evaluation template by its name and user.
     *
     * @param string $name the name of the evaluation template
     * @param User   $user the user associated with the evaluation template
     *
     * @return EvaluationTemplate|null returns the found EvaluationTemplate or null if not found
     */
    public function findByNameAndUser(string $name, User $user): ?EvaluationTemplate
    {
        return $this->createQueryBuilder('et')
            ->where('et.canonicalName = :name')
            ->andWhere('et.user = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('name', Canonicalizer::canonicalize($name)),
                new Parameter('user', $user),
            ]))
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find evaluation templates by their IDs and user.
     *
     * @param array $ids  the IDs of the evaluation templates
     * @param User  $user the user associated with the evaluation templates
     *
     * @return EvaluationTemplate[] returns an array of EvaluationTemplate objects
     */
    public function findByIdsAndUser(array $ids, User $user): array
    {
        return $this->createQueryBuilder('et')
            ->where('et.id IN (:ids)')
            ->andWhere('et.user = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('ids', $ids),
                new Parameter('user', $user),
            ]))
            ->getQuery()
            ->getResult();
    }

    /**
     * Deletes entities associated with a specific user.
     *
     * @param User $user The user whose associated entities should be deleted.
     *
     * @return int The number of entities deleted.
     */
    public function deleteByUser(User $user): int
    {
        return $this->createQueryBuilder('et')
            ->delete()
            ->where('et.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }

    /**
     * Finds evaluation template records associated with a specific user that do not have a workspace assigned.
     *
     * This method constructs a query to retrieve evaluation template records
     * where the associated user matches the given user instance and the workspace is null.
     *
     * @param User $user The user entity whose evaluation template records should be retrieved.
     *
     * @return EvaluationTemplate[] An array of EvaluationTemplate entities representing evaluation templates without a workspace.
     */
    public function findByUserWithoutWorkspace(User $user): array
    {
        return $this->createQueryBuilder('etc')
            ->andWhere('etc.user = :user')
            ->andWhere('etc.workspace IS NULL')
            ->setParameter('user', $user)
            ->orderBy('etc.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
}

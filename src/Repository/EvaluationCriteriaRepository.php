<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\EvaluationCriteria;
use App\Entity\User;
use App\Util\Canonicalizer;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Query\Parameter;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class EvaluationCriteriaRepository.
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<EvaluationCriteria>
 *
 * @method EvaluationCriteria      create()
 * @method EvaluationCriteria|null find($id, $lockMode = null, $lockVersion = null)
 * @method EvaluationCriteria|null findOneBy(array $criteria, array $orderBy = null)
 * @method EvaluationCriteria|null findByPublicId(string $publicId)
 * @method EvaluationCriteria[]    findAll()
 * @method EvaluationCriteria[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EvaluationCriteriaRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EvaluationCriteria::class);
    }

    /**
     * Finds an EvaluationCriteria by its publicId and associated user.
     *
     * @param string $publicId the unique publicId of the evaluation criteria
     * @param User   $user     the user associated with the evaluation criteria
     *
     * @return EvaluationCriteria|null the found evaluation criteria or null if not found
     */
    public function findByPublicIdAndUser(string $publicId, User $user): ?EvaluationCriteria
    {
        return $this->createQueryBuilder('ec')
            ->andWhere('ec.publicId = :publicId')
            ->andWhere('ec.user = :user')
            ->setParameter('publicId', $publicId)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find evaluation criteria by user.
     *
     * @param UserInterface|User|null $user the user to filter by
     *
     * @return QueryBuilder returns a QueryBuilder instance for further query customization
     */
    public function findByUserQueryBuilder(UserInterface|User|null $user): QueryBuilder
    {
        return $this->createQueryBuilder('ec')
            ->andWhere('ec.user = :user')
            ->setParameter('user', $user);
    }

    /**
     * Find evaluation criteria by label and user.
     *
     * @param string $label the label to filter by
     * @param User   $user  the user to filter by
     *
     * @return EvaluationCriteria|null returns the found evaluation criteria or null if not found
     */
    public function findByLabelAndUser(string $label, User $user): ?EvaluationCriteria
    {
        return $this->createQueryBuilder('ec')
            ->where('ec.canonicalLabel = :label')
            ->andWhere('ec.user = :user')
            ->setParameters(
                new ArrayCollection([
                    new Parameter('label', Canonicalizer::canonicalize($label)),
                    new Parameter('user', $user),
                ])
            )
            ->getQuery()
            ->getOneOrNullResult();

    }

    /**
     * Find evaluation criteria by IDs and user.
     *
     * @param array $ids  the IDs of the evaluation criteria to find
     * @param User  $user the user associated with the evaluation criteria
     *
     * @return EvaluationCriteria[] returns an array of found evaluation criteria
     */
    public function findByIdsAndUser(array $ids, User $user): array
    {
        return $this->createQueryBuilder('ec')
            ->andWhere('ec.id IN (:ids)')
            ->andWhere('ec.user = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('ids', $ids),
                new Parameter('user', $user),
            ]))
            ->getQuery()
            ->getResult();
    }

    public function findByUser(User $user)
    {
        return $this->createQueryBuilder('ec')
            ->where('ec.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

    /**
     * Delete evaluation criteria associated with a user.
     *
     * @param User $user the user associated with the evaluation criteria to delete
     *
     * @return int the number of deleted evaluation criteria
     */
    public function deleteByUser(User $user): int
    {
        return $this->createQueryBuilder('ec')
            ->delete()
            ->where('ec.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }
}

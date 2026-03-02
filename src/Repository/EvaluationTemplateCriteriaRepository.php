<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\EvaluationTemplateCriteria;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Query\Parameter;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class EvaluationTemplateCriteriaRepository.
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<EvaluationTemplateCriteria>
 *
 * @method EvaluationTemplateCriteria      create()
 * @method EvaluationTemplateCriteria|null find($id, $lockMode = null, $lockVersion = null)
 * @method EvaluationTemplateCriteria|null findOneBy(array $criteria, array $orderBy = null)
 * @method EvaluationTemplateCriteria|null findByPublicId(string $publicId)
 * @method EvaluationTemplateCriteria[]    findAll()
 * @method EvaluationTemplateCriteria[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EvaluationTemplateCriteriaRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EvaluationTemplateCriteria::class);
    }

    /**
     * Finds EvaluationTemplateCriteria by the associated user.
     *
     * @param UserInterface|User|null $user the user associated with the evaluation template criteria
     *
     * @return QueryBuilder the query builder for fetching evaluation template criteria by user
     */
    public function findByUserQueryBuilder(UserInterface|User|null $user): QueryBuilder
    {
        return $this->createQueryBuilder('ect')
            ->innerJoin('ect.template', 't')
            ->where('t.user = :user')
            ->setParameter('user', $user);
    }

    /**
     * Finds EvaluationTemplateCriteria by publicId and user.
     *
     * @param string $publicId the publicId of the evaluation template criteria
     * @param User   $user       the user associated with the evaluation template criteria
     *
     * @return EvaluationTemplateCriteria|null the found evaluation template criteria or null if not found
     */
    public function findByPublicIdAndUser(string $publicId, User $user): ?EvaluationTemplateCriteria
    {
        return $this->createQueryBuilder('etc')
            ->innerJoin('etc.template', 't')
            ->where('etc.publicId = :publicId')
            ->andWhere('t.user = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('publicId', $publicId),
                new Parameter('user', $user),
            ]))
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Finds evaluation template criteria records associated with a specific user that do not have a workspace assigned.
     *
     * This method constructs a query to retrieve evaluation template criteria records
     * where the associated user matches the given user instance and the workspace is null.
     *
     * @param User $user The user entity whose evaluation template criteria records should be retrieved.
     *
     * @return EvaluationTemplateCriteria[] An array of EvaluationTemplateCriteria entities representing evaluation template criteria records without a workspace.
     */
    public function findByUserWithoutWorkspace(User $user): array
    {
        return $this->createQueryBuilder('et')
            ->andWhere('et.user = :user')
            ->andWhere('et.workspace IS NULL')
            ->setParameter('user', $user)
            ->orderBy('et.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
}

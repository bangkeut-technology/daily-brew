<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\EvaluationCriteria;
use App\Entity\User;
use App\Util\CanonicalizerInterface;
use App\Util\TokenGenerator;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Query\Parameter;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Random\RandomException;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class EvaluationCriteriaRepository.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<EvaluationCriteria>
 *
 * @method EvaluationCriteria      create()
 * @method EvaluationCriteria|null find($id, $lockMode = null, $lockVersion = null)
 * @method EvaluationCriteria|null findOneBy(array $criteria, array $orderBy = null)
 * @method EvaluationCriteria[]    findAll()
 * @method EvaluationCriteria[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EvaluationCriteriaRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry, private readonly CanonicalizerInterface $canonicalizer)
    {
        parent::__construct($registry, EvaluationCriteria::class);
    }

    /**
     * Finds an EvaluationCriteria by its identifier and associated user.
     *
     * @param string $identifier the unique identifier of the evaluation criteria
     * @param User   $user       the user associated with the evaluation criteria
     *
     * @return EvaluationCriteria|null the found evaluation criteria or null if not found
     */
    public function findByIdentifierAndUser(string $identifier, User $user): ?EvaluationCriteria
    {
        return $this->createQueryBuilder('ec')
            ->andWhere('ec.identifier = :identifier')
            ->andWhere('ec.user = :user')
            ->setParameter('identifier', $identifier)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Update an evaluation criteria.
     *
     * @param EvaluationCriteria $evaluationCriteria the evaluation criteria to update
     * @param bool               $andFlush           whether to flush the changes (default true)
     *
     * @throws RandomException throws an exception if the identifier already exists
     */
    public function updateEvaluationCriteria(EvaluationCriteria $evaluationCriteria, bool $andFlush = true): void
    {
        $evaluationCriteria->setCanonicalLabel($this->canonicalizer->canonicalizeString($evaluationCriteria->getLabel()));
        if (null === $evaluationCriteria->getIdentifier()) {
            $string = TokenGenerator::getString(symbols: false);
            do {
                $identifier = TokenGenerator::generateFromString($string);
            } while ($this->isIdentifierExists($identifier));

            $evaluationCriteria->setIdentifier($identifier);
        }

        $this->update($evaluationCriteria, $andFlush);
    }

    /**
     * Check if an identifier already exists for an evaluation criteria.
     *
     * @param string $identifier the identifier to check
     *
     * @return bool returns true if the identifier exists, false otherwise
     */
    public function isIdentifierExists(string $identifier): bool
    {
        return $this->createQueryBuilder('ec')
                ->select('COUNT(ec.id)')
                ->where('ec.identifier = :identifier')
                ->setParameter('identifier', $identifier)
                ->getQuery()
                ->getSingleScalarResult() > 0;
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
                    new Parameter('label', $this->canonicalizer->canonicalizeString($label)),
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
}

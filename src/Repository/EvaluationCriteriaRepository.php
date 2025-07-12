<?php
declare(strict_types=1);


namespace App\Repository;

use App\Entity\EvaluationCriteria;
use App\Entity\User;
use App\Util\CanonicalizerInterface;
use App\Util\TokenGenerator;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Random\RandomException;

/**
 * Class EvaluationCriteriaRepository
 *
 * @package App\Repository
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
     * @param string $identifier The unique identifier of the evaluation criteria.
     * @param User   $user       The user associated with the evaluation criteria.
     *
     * @return EvaluationCriteria|null The found evaluation criteria or null if not found.
     */
    public function findByIdentifierAndUser(string $identifier, User $user): ?EvaluationCriteria
    {
        return $this->createQueryBuilder('ec')
            ->andWhere('ec.identifier = :identifier')
            ->andWhere('ec.user = :user')
            ->setParameter('identifier', $identifier)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    /**
     * Update an evaluation criteria.
     *
     * @param EvaluationCriteria $evaluationCriteria The evaluation criteria to update.
     * @param bool               $andFlush           Whether to flush the changes (default true).
     * @return void
     * @throws RandomException Throws an exception if the identifier already exists.
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
     * @param string $identifier The identifier to check.
     * @return bool Returns true if the identifier exists, false otherwise.
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
}

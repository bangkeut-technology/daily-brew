<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\EvaluationTemplate;
use App\Entity\User;
use App\Util\CanonicalizerInterface;
use App\Util\TokenGenerator;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Random\RandomException;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class EvaluationTemplateRepository.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<EvaluationTemplate>
 *
 * @method EvaluationTemplate      create()
 * @method EvaluationTemplate|null find($id, $lockMode = null, $lockVersion = null)
 * @method EvaluationTemplate|null findOneBy(array $criteria, array $orderBy = null)
 * @method EvaluationTemplate[]    findAll()
 * @method EvaluationTemplate[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EvaluationTemplateRepository extends AbstractRepository
{
    public function __construct(
        ManagerRegistry $registry,
        private readonly CanonicalizerInterface $canonicalizer,
    ) {
        parent::__construct($registry, EvaluationTemplate::class);
    }

    /**
     * Update an evaluation template.
     *
     * @param EvaluationTemplate $evaluationTemplate the evaluation template to update
     * @param bool               $andFlush           whether to flush the changes (default true)
     *
     * @throws RandomException throws an exception if the identifier is already exists
     */
    public function updateEvaluationTemplate(EvaluationTemplate $evaluationTemplate, bool $andFlush = true): void
    {
        $evaluationTemplate->setCanonicalName($this->canonicalizer->canonicalizeString($evaluationTemplate->getName()));
        if (null === $evaluationTemplate->getIdentifier()) {
            $string = TokenGenerator::getString(symbols: false);
            do {
                $identifier = TokenGenerator::generateFromString($string);
            } while ($this->isIdentifierExists($identifier));

            $evaluationTemplate->setIdentifier($identifier);
        }

        $this->update($evaluationTemplate, $andFlush);
    }

    /**
     * Find an evaluation template by its identifier.
     *
     * @param string $identifier the identifier of the evaluation template
     */
    public function findByIdentifier(string $identifier): ?EvaluationTemplate
    {
        return $this->findOneBy(['identifier' => $identifier]);
    }

    /**
     * Find an evaluation template by its identifier and user.
     *
     * @param string $identifier the identifier of the evaluation template
     * @param User   $user       the user associated with the evaluation template
     */
    public function findByIdentifierAndUser(string $identifier, User $user): ?EvaluationTemplate
    {
        return $this->findOneBy([
            'identifier' => $identifier,
            'user' => $user,
        ]);
    }

    /**
     * Check if an identifier already exists for an evaluation template.
     *
     * @param string $identifier the identifier to check
     *
     * @return bool returns true if the identifier exists, false otherwise
     */
    public function isIdentifierExists(string $identifier): bool
    {
        return $this->createQueryBuilder('et')
                ->select('COUNT(et.id)')
                ->where('et.identifier = :identifier')
                ->setParameter('identifier', $identifier)
                ->getQuery()
                ->getSingleScalarResult() > 0;
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
}

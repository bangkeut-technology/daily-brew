<?php
declare(strict_types=1);


namespace App\Repository;

use App\Entity\Employee;
use App\Entity\EmployeeEvaluation;
use App\Entity\EvaluationTemplate;
use App\Util\TokenGenerator;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Query\Parameter;
use Doctrine\Persistence\ManagerRegistry;
use Random\RandomException;

/**
 * Class EmployeeEvaluationRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<EmployeeEvaluation>
 *
 * @method EmployeeEvaluation      create()
 * @method EmployeeEvaluation|null find($id, $lockMode = null, $lockVersion = null)
 * @method EmployeeEvaluation|null findOneBy(array $criteria, array $orderBy = null)
 * @method EmployeeEvaluation[]    findAll()
 * @method EmployeeEvaluation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EmployeeEvaluationRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EmployeeEvaluation::class);
    }

    /**
     * Find evaluations by date and employee.
     *
     * @param DateTimeImmutable $date
     * @param Employee          $employee
     *
     * @return EmployeeEvaluation|null
     */
    public function findByDateAndEmployee(DateTimeImmutable $date, Employee $employee): ?EmployeeEvaluation
    {
        return $this->createQueryBuilder('ee')
            ->innerJoin('ee.scores', 'ees')
            ->where('ee.evaluatedAt = :date')
            ->andWhere('ee.employee = :employee')
            ->setParameters(new ArrayCollection([
                new Parameter('date', $date, Types::DATE_IMMUTABLE),
                new Parameter('employee', $employee),
            ]))
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Update an employee evaluation.
     *
     * @param EmployeeEvaluation $employeeEvaluation The employee evaluation to update.
     * @param bool               $andFlush           Whether to flush the changes (default true).
     *
     * @throws RandomException Throws an exception if the identifier already exists.
     */
    public function updateEmployeeEvaluation(EmployeeEvaluation $employeeEvaluation, bool $andFlush = true): void
    {
        if (null === $employeeEvaluation->getIdentifier()) {
            $string = TokenGenerator::getString(symbols: false);
            do {
                $identifier = TokenGenerator::generateFromString($string);
            } while ($this->isIdentifierExists($identifier));

            $employeeEvaluation->setIdentifier($identifier);
        }

        $this->update($employeeEvaluation, $andFlush);
    }


    /**
     * Check if an identifier already exists.
     *
     * @param string $identifier
     *
     * @return bool
     */
    public function isIdentifierExists(string $identifier): bool
    {
        return $this->createQueryBuilder('ee')
                ->select('COUNT(ee.id)')
                ->where('ee.identifier = :identifier')
                ->setParameter('identifier', $identifier)
                ->getQuery()
                ->getSingleScalarResult() > 0;
    }

    /**
     * Find evaluations by period and employee.
     *
     * @param DateTimeImmutable $from     The start date of the period.
     * @param DateTimeImmutable $to       The end date of the period.
     * @param Employee          $employee The employee to filter evaluations by.
     *
     * @return EmployeeEvaluation[]
     */
    public function findByPeriodAndEmployee(DateTimeImmutable $from, DateTimeImmutable $to, Employee $employee): array
    {
        return $this->createQueryBuilder('ee')
            ->innerJoin('ee.scores', 'ees')
            ->where('ee.evaluatedAt BETWEEN :from AND :to')
            ->andWhere('ee.employee = :employee')
            ->setParameters(new ArrayCollection([
                new Parameter('from', $from, Types::DATE_IMMUTABLE),
                new Parameter('to', $to, Types::DATE_IMMUTABLE),
                new Parameter('employee', $employee),
            ]))
            ->getQuery()
            ->getResult();
    }

    /**
     * Get the average score for an employee over a specified period.
     *
     * @param Employee          $employee The employee to calculate the average score for.
     * @param DateTimeImmutable $from     The start date of the period.
     * @param DateTimeImmutable $to       The end date of the period.
     *
     * @return float The average score.
     */
    public function getAverageScoreForPeriod(Employee $employee, DateTimeImmutable $from, DateTimeImmutable $to): float
    {
        $qb = $this->createQueryBuilder('ee')
            ->select('ROUND(AVG(ees.score), 2) AS averageScore')
            ->innerJoin('ee.scores', 'ees')
            ->where('ee.evaluatedAt BETWEEN :from AND :to')
            ->andWhere('ee.employee = :employee')
            ->setParameters(new ArrayCollection([
                new Parameter('from', $from, Types::DATE_IMMUTABLE),
                new Parameter('to', $to, Types::DATE_IMMUTABLE),
                new Parameter('employee', $employee),
            ]));

        return (float)$qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Get the list of average scores for employees over a specified period
     * @param Employee[]        $employees The employees to calculate the average score for.
     * @param DateTimeImmutable $from      The start date of the period.
     * @param DateTimeImmutable $to        The end date of the period.
     * @return array
     */
    public function getAverageScoresForPeriod(array $employees, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $qb = $this->createQueryBuilder('ee')
            ->select('ROUND(AVG(ees.score), 2) AS averageScore')
            ->addSelect('e.id as employeeId')
            ->innerJoin('ee.scores', 'ees')
            ->innerJoin('ee.employee', 'e')
            ->where('ee.evaluatedAt BETWEEN :from AND :to')
            ->andWhere('ee.employee IN (:employees)')
            ->setParameters(new ArrayCollection([
                new Parameter('from', $from, Types::DATE_IMMUTABLE),
                new Parameter('to', $to, Types::DATE_IMMUTABLE),
                new Parameter('employees', $employees),
            ]));

        return $qb->getQuery()->getArrayResult();
    }
}

<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\EmployeeEvaluation;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Query\Parameter;
use Doctrine\Persistence\ManagerRegistry;

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
 * @method EmployeeEvaluation|null findByPublicId(string $publicId)
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
     * Find an evaluation by its evaluatedAt and employee.
     *
     * @param DateTimeImmutable $date     The date of the evaluation
     * @param Employee          $employee The employee associated with the evaluation
     *
     * @return EmployeeEvaluation|null
     */
    public function findByEvaluatedAtAndEmployee(DateTimeImmutable $date, Employee $employee): ?EmployeeEvaluation
    {
        return $this->createQueryBuilder('ee')
            ->select('ee, ees, eet')
            ->innerJoin('ee.template', 'eet')
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
     * Find evaluations by period and employee.
     *
     * @param DateTimeImmutable $from     the start date of the period
     * @param DateTimeImmutable $to       the end date of the period
     * @param Employee          $employee the employee to filter evaluations by
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
     * @param Employee          $employee the employee to calculate the average score for
     * @param DateTimeImmutable $from     the start date of the period
     * @param DateTimeImmutable $to       the end date of the period
     *
     * @return float the average score
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
     * Get the list of average scores for employees over a specified period.
     *
     * @param Employee[]        $employees the employees to calculate the average score for
     * @param DateTimeImmutable $from      the start date of the period
     * @param DateTimeImmutable $to        the end date of the period
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
            ]))
            ->groupBy('e.id');

        return $qb->getQuery()->getArrayResult();
    }

    /**
     * Get the average score for a user over a specified period.
     *
     * @param User              $user the user to calculate the average score for
     * @param DateTimeImmutable $from the start date of the period
     * @param DateTimeImmutable $to   the end date of the period
     * @return int the average score
     */
    public function getAverageScoresForPeriodByUser(User $user, DateTimeImmutable $from, DateTimeImmutable $to): int
    {
        $qb = $this->createQueryBuilder('ee')
            ->select('ROUND(AVG(scores.score), 2) AS averageScore')
            ->innerJoin('ee.scores', 'scores')
            ->where('ee.evaluatedAt BETWEEN :from AND :to')
            ->andWhere('ee.evaluator = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('from', $from, Types::DATE_IMMUTABLE),
                new Parameter('to', $to, Types::DATE_IMMUTABLE),
                new Parameter('user', $user),
            ]));

        return $qb->getQuery()->getSingleScalarResult() ?? 0;
    }

    /**
     * Finds an entity by its public ID and associated user.
     *
     * @param string $publicId The public ID of the entity.
     * @param User   $user     The associated user.
     *
     * @return EmployeeEvaluation|null The entity matching the public ID and user, or null if not found.
     */
    public function findByPublicIdAndUser(string $publicId, User $user): ?EmployeeEvaluation
    {
        return $this->createQueryBuilder('ee')
            ->select('ee, ees, eet')
            ->innerJoin('ee.template', 'eet')
            ->innerJoin('ee.scores', 'ees')
            ->where('ee.publicId = :publicId')
            ->andWhere('ee.user = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('publicId', $publicId),
                new Parameter('user', $user),
            ]))
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Finds evaluations by given criteria and order parameters.
     *
     * This method builds a query to fetch evaluations along with related entities such as
     * criteria, scores, template, and employee based on the provided filters and sorting options.
     *
     * @param array    $criteria The filtering criteria as an associative array, where keys represent field names and values represent expected values.
     * @param array    $orderBy  An associative array specifying sorting options, where keys are field names and values are the sorting direction ('ASC' or 'DESC').
     * @param int|null $offset   The starting position for the result set, or null to start from the beginning.
     * @param int|null $limit    The maximum number of results to return, or null for no limit.
     *
     * @return EmployeeEvaluation[] Returns an array of found evaluations with their associated entities.
     */
    public function findByCriteria(array $criteria, array $orderBy = [], ?int $offset = null, ?int $limit = null): array
    {
        $qb = $this->createQueryBuilder('evaluation')
            ->select('evaluation, criteria, scores, template, employee')
            ->innerJoin('evaluation.employee', 'employee')
            ->leftJoin('evaluation.template', 'template')
            ->innerJoin('evaluation.scores', 'scores')
            ->leftJoin('scores.criteria', 'criteria')
            ->where('employee.user = :user')
            ->andWhere('employee.publicId = :employee OR :employee IS NULL')
            ->andWhere('template.publicId = :template OR :template IS NULL')
            ->andWhere('evaluation.evaluatedAt >= :from OR :from IS NULL')
            ->andWhere('evaluation.evaluatedAt <= :to OR :to IS NULL')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        $parameters = new ArrayCollection();
        foreach ($criteria as $key => $value) {
            $parameters->add(new Parameter($key, $value));
        }
        $qb->setParameters($parameters);

        foreach ($orderBy as $sort => $sort) {
            $qb->addOrderBy($sort, $sort);
        }

        return $qb->getQuery()
            ->getResult();
    }

    /**
     * Finds employee evaluations for a Gantt chart within the specified date range and employee list.
     *
     * This method retrieves evaluations by constructing a query with conditions based on the provided user, employee identifiers,
     * and date range. The query includes inner joins on related entities such as template, scores, and employee to fetch related data.
     *
     * @param User|null         $user      The user to filter the evaluations by, or null to exclude user filtering.
     * @param array             $employees List of employee public IDs to filter the evaluations by.
     * @param DateTimeImmutable $from      The starting date of the evaluation period, or null for no lower date limit.
     * @param DateTimeImmutable $to        The ending date of the evaluation period, or null for no upper date limit.
     *
     * @return EmployeeEvaluation[] Returns an array of employee evaluations matching the criteria.
     */
    public function findForGantt(?User $user, array $employees, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $qb = $this->createQueryBuilder('employee_evaluation')
            ->addSelect('template')
            ->addSelect('scores')
            ->addSelect('employee')
            ->innerJoin('employee_evaluation.template', 'template')
            ->innerJoin('employee_evaluation.scores', 'scores')
            ->innerJoin('employee_evaluation.employee', 'employee')
            ->where('employee_evaluation.evaluatedAt >= :from OR :from IS NULL')
            ->andWhere('employee_evaluation.evaluatedAt <= :to OR :to IS NULL')
            ->andWhere('employee.publicId IN (:employees)')
            ->andWhere('employee_evaluation.evaluator = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('from', $from, Types::DATE_IMMUTABLE),
                new Parameter('to', $to, Types::DATE_IMMUTABLE),
                new Parameter('employees', $employees),
                new Parameter('user', $user),
            ]));

        return $qb->getQuery()->getResult();
    }

    /**
     * Finds the most recent employee evaluations performed by a specific evaluator.
     *
     * @param User $user  The evaluator whose evaluations need to be retrieved.
     * @param int  $limit The maximum number of evaluations to retrieve. Default is 10.
     *
     * @return array An array of EmployeeEvaluation entities ordered by evaluation date in descending order.
     */
    public function findRecentByEvaluator(User $user, int $limit = 10): array
    {
        return $this->createQueryBuilder('ee')
            ->addSelect('e')
            ->innerJoin('ee.employee', 'e')
            ->andWhere('ee.evaluator = :user')
            ->setParameter('user', $user)
            ->orderBy('ee.evaluatedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}

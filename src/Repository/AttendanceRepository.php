<?php
declare(strict_types=1);


namespace App\Repository;


use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\User;
use App\Enum\AttendanceStatusEnum;
use App\Enum\LeaveTypeEnum;
use DatePeriod;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Query\Parameter;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repository for managing Attendance entities.
 * Extends the base AbstractRepository to provide custom query methods
 * specific to attendance records.
 */
class AttendanceRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Attendance::class);
    }

    /**
     * Find attendances by period and user.
     *
     * @param DateTimeImmutable|null $from The start date of the period, or null for no start limit.
     * @param DateTimeImmutable|null $to   The end date of the period, or null for no end limit.
     * @param User                   $user The user for whom to find attendances.
     * @return Attendance[]
     */
    public function findByPeriodAndUser(?DateTimeImmutable $from, ?DateTimeImmutable $to, User $user): array
    {
        return $this->createQueryBuilder('a')
            ->addSelect('e')
            ->innerJoin('attendance.employee', 'e')
            ->where('attendance.user = :user')
            ->andWhere('attendance.attendanceDate >= :from OR :from IS NULL')
            ->andWhere('attendance.attendanceDate <= :to OR :to IS NULL')
            ->setParameters(new ArrayCollection([
                new Parameter('user', $user),
                new Parameter('from', $from, Types::DATE_IMMUTABLE),
                new Parameter('to', $to, Types::DATE_IMMUTABLE),
            ]))
            ->getQuery()
            ->getResult();
    }

    public function findByCriteria(array $criteria, array $orderBy = [], $limit = null, $offset = null)
    {
        $qb = $this->createQueryBuilder('attendance')
            ->addSelect('employee')
            ->addSelect('user')
            ->innerJoin('attendance.employee', 'employee')
            ->innerJoin('attendance.user', 'user')
            ->where('attendance.attendanceDate >= :from OR :from IS NULL')
            ->andWhere('attendance.attendanceDate <= :to OR :to IS NULL')
            ->andWhere('attendance.status = :status OR :status IS NULL')
            ->andWhere('employee.publicId = :employee OR :employee IS NULL')
            ->andWhere('user.publicId = :user OR :user IS NULL')
            ->setParameters(new ArrayCollection([
                new Parameter('from', $criteria['from'], Types::DATE_IMMUTABLE),
                new Parameter('to', $criteria['to'], Types::DATE_IMMUTABLE),
                new Parameter('user', $criteria['user']),
                new Parameter('employee', $criteria['employee']),
                new Parameter('status', $criteria['status']),
            ]))
            ->setMaxResults($limit)
            ->setFirstResult($offset);

        foreach ($orderBy as $sort => $sort) {
            $qb->addOrderBy($sort, $sort);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Find attendances by user.
     *
     * @param User $user The user for whom to find attendances.
     * @return Attendance[]
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('a')
            ->addSelect('e')
            ->innerJoin('attendance.employee', 'e')
            ->where('attendance.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find attendances by employee and period.
     *
     * @param Employee          $employee The employee for whom to find attendances.
     * @param DateTimeImmutable $from     The start date of the period.
     * @param DateTimeImmutable $to       The end date of the period.
     * @return Attendance[]
     */
    public function findByEmployeeAndPeriod(Employee $employee, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        return $this->createQueryBuilder('a')
            ->addSelect('e')
            ->innerJoin('attendance.employee', 'e')
            ->where('attendance.employee = :employee')
            ->andWhere('attendance.attendanceDate >= :from')
            ->andWhere('attendance.attendanceDate <= :to')
            ->setParameters(new ArrayCollection([
                new Parameter('employee', $employee),
                new Parameter('from', $from, Types::DATE_IMMUTABLE),
                new Parameter('to', $to, Types::DATE_IMMUTABLE),
            ]))
            ->getQuery()
            ->getResult();
    }

    /**
     * Find an attendance by its public ID and user.
     *
     * @param string    $publicId The public ID of the attendance.
     * @param User|null $getUser  The user associated with the attendance, or null if not applicable.
     * @return Attendance|null
     */
    public function findByPublicIdAndUser(string $publicId, ?User $getUser): ?Attendance
    {
        return $this->createQueryBuilder('a')
            ->addSelect('e')
            ->innerJoin('attendance.employee', 'e')
            ->where('attendance.publicId = :publicId')
            ->andWhere('attendance.user = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('publicId', $publicId),
                new Parameter('user', $getUser),
            ]))
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Finds attendance data for Gantt chart visualization based on provided criteria.
     *
     * @param array $criteria A set of filters to retrieve attendance data. Expected keys:
     *                        - 'from': Start date of the attendance range (nullable, DATE_IMMUTABLE).
     *                        - 'to': End date of the attendance range (nullable, DATE_IMMUTABLE).
     *                        - 'employees': Array of employee public IDs to filter by.
     *                        - 'user': Public ID of the user associated with the attendance.
     *
     * @return Attendance[] The array of attendance records matching the given criteria.
     */
    public function findForGantt(array $criteria): array
    {
        return $this->createQueryBuilder('attendance')
            ->addSelect('employee')
            ->addSelect('user')
            ->innerJoin('attendance.employee', 'employee')
            ->innerJoin('attendance.user', 'user')
            ->where('attendance.attendanceDate >= :from OR :from IS NULL')
            ->andWhere('attendance.attendanceDate <= :to OR :to IS NULL')
            ->andWhere('employee.publicId in (:employees)')
            ->andWhere('user.publicId = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('from', $criteria['from'], Types::DATE_IMMUTABLE),
                new Parameter('to', $criteria['to'], Types::DATE_IMMUTABLE),
                new Parameter('employees', $criteria['employees']),
                new Parameter('user', $criteria['user']),
            ]))
            ->getQuery()
            ->getResult();
    }

    /**
     * Count the number of late attendances for a specific employee within a given period.
     *
     * @param Employee   $employee The employee whose late attendances are being counted.
     * @param DatePeriod $period   The period within which to count the late attendances.
     * @return int The count of late attendances.
     */
    public function countLate(Employee $employee, DatePeriod $period): int
    {
        return $this->countStatus(employee: $employee, period: $period, status: AttendanceStatusEnum::LATE);
    }

    /**
     * Counts the number of absences for a given employee within a specified date period.
     *
     * @param Employee   $employee The employee for whom the absences are being counted.
     * @param DatePeriod $period   The date range within which absences are counted.
     *
     * @return int The total count of absences.
     */
    public function countAbsent(Employee $employee, DatePeriod $period): int
    {
        return $this->countStatus(employee: $employee, period: $period, status: AttendanceStatusEnum::ABSENT);
    }

    /**
     * Counts the occurrences of a specific attendance status for a given employee within a specified date period.
     *
     * @param Employee             $employee The employee for whom the status is being counted.
     * @param DatePeriod           $period   The date range within which the status is counted.
     * @param AttendanceStatusEnum $status   The attendance status to be counted.
     *
     * @return int The total count of the specified attendance status.
     */
    public function countStatus(Employee $employee, DatePeriod $period, AttendanceStatusEnum $status): int
    {
        return $this->createQueryBuilder('attendance')
            ->select('COUNT(attendance.id)')
            ->where('attendance.employee = :employee')
            ->andWhere('attendance.attendanceDate >= :from')
            ->andWhere('attendance.attendanceDate <= :to')
            ->andWhere('attendance.status = :status')
            ->setParameters(new ArrayCollection([
                new Parameter('employee', $employee),
                new Parameter('from', $period->getStartDate(), Types::DATE_IMMUTABLE),
                new Parameter('to', $period->getEndDate(), Types::DATE_IMMUTABLE),
                new Parameter('status', $status),
            ]))
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Counts the number of paid leaves for a specific user within a given date range.
     *
     * @param User              $user  The user whose paid leaves are to be counted.
     * @param DateTimeImmutable $start The start date of the period for which to count paid leaves.
     * @param DateTimeImmutable $end   The end date of the period for which to count paid leaves.
     *
     * @return int The total number of paid leaves within the specified range.
     */
    public function countPaidLeavesBetween(User $user, DateTimeImmutable $start, DateTimeImmutable $end): int
    {
        return $this->createFindPaidLeavesBetweenQuery($user, $start, $end)
            ->select('COUNT(attendance.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Finds the total number of paid leave records for a specified user within a specified date range.
     *
     * @param User              $user  The user for whom the paid leaves are being queried.
     * @param DateTimeImmutable $start The start date of the date range.
     * @param DateTimeImmutable $end   The end date of the date range.
     *
     * @return Attendance[] The list of paid leave records within the specified range.
     */
    public function findPaidLeavesBetween(User $user, DateTimeImmutable $start, DateTimeImmutable $end): array
    {
        return $this->createFindPaidLeavesBetweenQuery($user, $start, $end)
            ->getQuery()
            ->getResult();
    }

    /**
     * Creates a query builder to find paid leave records for a given user within a specified date range.
     *
     * @param User              $user  The user for whom the paid leave query is being constructed.
     * @param DateTimeImmutable $start The start date of the date range used in the query.
     * @param DateTimeImmutable $end   The end date of the date range used in the query.
     *
     * @return QueryBuilder The query builder configured to retrieve the specified paid leave records.
     */
    private function createFindPaidLeavesBetweenQuery(User $user, DateTimeImmutable $start, DateTimeImmutable $end): QueryBuilder
    {
        return $this->createQueryBuilder('attendance')
            ->where('attendance.user = :user')
            ->andWhere('attendance.attendanceDate >= :start')
            ->andWhere('attendance.attendanceDate <= :end')
            ->andWhere('attendance.status = :status')
            ->andWhere('attendance.leaveType = :leaveType')
            ->setParameters(new ArrayCollection([
                new Parameter('user', $user),
                new Parameter('start', $start, Types::DATE_IMMUTABLE),
                new Parameter('end', $end, Types::DATE_IMMUTABLE),
                new Parameter('leaveType', LeaveTypeEnum::PAID),
            ]));
    }
}

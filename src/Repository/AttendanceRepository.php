<?php
declare(strict_types=1);


namespace App\Repository;


use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\User;
use App\Enum\AttendanceTypeEnum;
use App\Enum\LeaveTypeEnum;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Query\Parameter;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class AttendanceRepository
 *
 *  Repository for managing Attendance entities.
 *  Extends the base AbstractRepository to provide custom query methods
 *  specific to attendance records.
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<Attendance>
 *
 * @method Attendance      create()
 * @method Attendance|null find($id, $lockMode = null, $lockVersion = null)
 * @method Attendance|null findOneBy(array $criteria, array $orderBy = null)
 * @method Attendance[]    findAll()
 * @method Attendance[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
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

        foreach ($orderBy as $sort => $order) {
            $qb->addOrderBy($sort, $order);
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
     *                        - 'From': Start date of the attendance range (nullable, DATE_IMMUTABLE).
     *                        - 'to': End date of the attendance range (nullable, DATE_IMMUTABLE).
     *                        - 'employees': Array of employee public IDs to filter by.
     *                        - 'User': Public ID of the user associated with the attendance.
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
     * @param Employee          $employee The employee whose late attendances are being counted.
     * @param DateTimeImmutable $start    The start date of the period.
     * @param DateTimeImmutable $end      The end date of the period.
     * @return int The count of late attendances.
     */
    public function countLate(Employee $employee, DateTimeImmutable $start, DateTimeImmutable $end): int
    {
        return $this->countStatus($employee, $start, $end, AttendanceTypeEnum::LATE);
    }

    /**
     * Counts the number of absences for a given employee within a specified date period.
     *
     * @param Employee          $employee The employee for whom the absences are being counted.
     * @param DateTimeImmutable $start    The start date of the period.
     * @param DateTimeImmutable $end      The end date of the period.
     *
     * @return int The total count of absences.
     */
    public function countAbsent(Employee $employee, DateTimeImmutable $start, DateTimeImmutable $end): int
    {
        return $this->countStatus($employee, $start, $end, AttendanceTypeEnum::ABSENT);
    }

    /**
     * Counts the occurrences of a specific attendance status for a given employee within a specified date period.
     *
     * @param Employee           $employee The employee for whom the status is being counted.
     * @param DateTimeImmutable  $start    The start date of the period.
     * @param DateTimeImmutable  $end      The end date of the period.
     * @param AttendanceTypeEnum $status   The attendance status to be counted.
     *
     * @return int The total count of the specified attendance status.
     */
    public function countStatus(Employee $employee, DateTimeImmutable $start, DateTimeImmutable $end, AttendanceTypeEnum $status): int
    {
        return $this->createStatusBetweenQuery($employee, $start, $end, $status)
            ->select('COUNT(attendance.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Counts the occurrences of a specific attendance status for a given employee within a specified date period.
     *
     * @param Employee           $employee The employee for whom the status is being counted.
     * @param DateTimeImmutable  $start    The start date of the period.
     * @param DateTimeImmutable  $end      The end date of the period.
     * @param AttendanceTypeEnum $status   The attendance status to be counted.
     *
     * @return Attendance[] The list of attendance records matching the specified status within the given period.
     */
    public function findStatus(Employee $employee, DateTimeImmutable $start, DateTimeImmutable $end, AttendanceTypeEnum $status): array
    {
        return $this->createStatusBetweenQuery($employee, $start, $end, $status)
            ->getQuery()
            ->getResult();
    }

    /**
     * Finds the total number of paid leave records for a specified user within a specified date range.
     *
     * @param Employee          $employee The employee for whom the paid leave records are being counted.
     * @param DateTimeImmutable $start    The start date of the date range.
     * @param DateTimeImmutable $end      The end date of the date range.
     *
     * @return Attendance[] The list of paid leave records within the specified range.
     */
    public function findPaidLeavesBetween(Employee $employee, DateTimeImmutable $start, DateTimeImmutable $end): array
    {
        return $this->createPaidLeavesBetweenQuery($employee, $start, $end)
            ->getQuery()
            ->getResult();
    }

    /**
     * Counts the number of paid leaves for a specific user within a given date range.
     *
     * @param Employee          $employee The employee for whom the paid leaves are being counted.
     * @param DateTimeImmutable $start    The start date of the period for which to count paid leaves.
     * @param DateTimeImmutable $end      The end date of the period for which to count paid leaves.
     *
     * @return int The total number of paid leaves within the specified range.
     */
    public function countPaidLeavesBetween(Employee $employee, DateTimeImmutable $start, DateTimeImmutable $end): int
    {
        return $this->createPaidLeavesBetweenQuery($employee, $start, $end)
            ->select('COUNT(attendance.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Creates a query builder to find paid leave records for a given user within a specified date range.
     *
     * @param Employee          $employee The employee for whom the paid leaves are being counted.
     * @param DateTimeImmutable $start    The start date of the date range used in the query.
     * @param DateTimeImmutable $end      The end date of the date range used in the query.
     *
     * @return QueryBuilder The query builder configured to retrieve the specified paid leave records.
     */
    private function createPaidLeavesBetweenQuery(Employee $employee, DateTimeImmutable $start, DateTimeImmutable $end): QueryBuilder
    {
        return $this->createQueryBuilder('attendance')
            ->where('attendance.employee = :employee')
            ->andWhere('attendance.attendanceDate >= :start')
            ->andWhere('attendance.attendanceDate <= :end')
            ->andWhere('attendance.status = :status')
            ->andWhere('attendance.leaveType = :leaveType')
            ->setParameters(new ArrayCollection([
                new Parameter('employee', $employee),
                new Parameter('start', $start, Types::DATE_IMMUTABLE),
                new Parameter('end', $end, Types::DATE_IMMUTABLE),
                new Parameter('leaveType', LeaveTypeEnum::PAID),
            ]));
    }

    /**
     * Creates a query to retrieve attendance records for an employee within a specific date range and with a specified status.
     *
     * @param Employee           $employee The employee whose attendance records are being queried.
     * @param DateTimeImmutable  $start    The start date of the query range.
     * @param DateTimeImmutable  $end      The end date of the query range.
     * @param AttendanceTypeEnum $status   The attendance status to filter by.
     *
     * @return QueryBuilder The query builder configured for retrieving the specified attendance records.
     */
    private function createStatusBetweenQuery(
        Employee             $employee,
        DateTimeImmutable    $start,
        DateTimeImmutable    $end,
        AttendanceTypeEnum $status
    ): QueryBuilder
    {
        return $this->createQueryBuilder('attendance')
            ->where('attendance.employee = :employee')
            ->andWhere('attendance.attendanceDate >= :from')
            ->andWhere('attendance.attendanceDate <= :to')
            ->andWhere('attendance.status = :status')
            ->setParameters(new ArrayCollection([
                new Parameter('employee', $employee),
                new Parameter('from', $start, Types::DATE_IMMUTABLE),
                new Parameter('to', $end, Types::DATE_IMMUTABLE),
                new Parameter('status', $status),
            ]));
    }

    /**
     * Counts the number of attendance records with a specific status for a given user on a specific date.
     *
     * @param User               $user      The user for whom the attendance records should be counted.
     *                                      If null, the count will be performed with no user restriction.
     * @param DateTimeImmutable  $today     The date for which the attendance records should be counted.
     * @param AttendanceTypeEnum $status    The attendance status to filter by.
     *
     * @return int The count of attendance records matching the criteria.
     */
    public function countByStatusOnDateForOwner(User $user, DateTimeImmutable $today, AttendanceTypeEnum $status): int
    {
        $qb = $this->createQueryBuilder('attendance')
            ->select('COUNT(attendance.id)')
            ->where('attendance.attendanceDate = :today')
            ->andWhere('attendance.status = :status')
            ->andWhere('attendance.user = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('today', $today, Types::DATE_IMMUTABLE),
                new Parameter('status', $status),
                new Parameter('user', $user),
            ]));

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Retrieves a list of upcoming leave records for a specific user within a given date range.
     *
     * @param User              $user             The owner of the leave records being queried.
     * @param DateTimeImmutable $from             The start of the date range for querying leaves.
     * @param DateTimeImmutable $to               The end of the date range for querying leaves.
     * @param string|null       $employeePublicId An optional employee ID to filter leave records for a specific employee.
     *
     * @return Attendance[] The list of leave records matching the criteria within the specified range.
     */
    public function findUpcomingLeaves(
        User              $user,
        DateTimeImmutable $from,
        DateTimeImmutable $to,
        ?string           $employeePublicId = null
    ): array
    {

        return $this->findUpcomingStatus($user, $from, $to, AttendanceTypeEnum::LEAVE, $employeePublicId);
    }

    /**
     * Retrieves upcoming attendance records with a specified status for a given owner within a specified date range.
     *
     * @param User               $user             The user who owns the attendance records.
     * @param DateTimeImmutable  $from             The start date of the date range.
     * @param DateTimeImmutable  $to               The end date of the date range.
     * @param AttendanceTypeEnum $status           The attendance status to filter by.
     * @param string|null        $employeePublicId Optional employee identifier for further filtering.
     *
     * @return Attendance[] The list of attendance records matching the specified criteria.
     */
    public function findUpcomingStatus(
        User               $user,
        DateTimeImmutable  $from,
        DateTimeImmutable  $to,
        AttendanceTypeEnum $status,
        ?string            $employeePublicId = null
    ): array
    {
        $qb = $this->createQueryBuilder('attendance')
            ->addSelect('employee')
            ->innerJoin('attendance.employee', 'employee')
            ->andWhere('employee.user = :user')
            ->andWhere('attendance.status = :status')
            ->andWhere('attendance.attendanceDate BETWEEN :from AND :to')
            ->setParameter('user', $user)
            ->setParameter('status', $status)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('attendance.attendanceDate', 'ASC');

        if ($employeePublicId) {
            $qb->andWhere('employee.publicId = :employeePublicId')
                ->setParameter('employeePublicId', $employeePublicId);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Checks if an attendance record exists for a specific user on a given date.
     *
     * @param User              $user           The user whose attendance record is being checked.
     * @param DateTimeImmutable $attendanceDate The date for which the attendance record is being checked.
     *
     * @return bool True if an attendance record exists for the user on the specified date, false otherwise.
     */
    public function existsForUserOnDay(User $user, DateTimeImmutable $attendanceDate): bool
    {
        return $this->createQueryBuilder('attendance')
            ->select('COUNT(attendance.id)')
            ->where('attendance.attendanceDate = :attendanceDate')
            ->andWhere('attendance.user = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('attendanceDate', $attendanceDate, Types::DATE_IMMUTABLE),
                new Parameter('user', $user),
            ]))
            ->getQuery()
            ->getSingleScalarResult();
    }
}

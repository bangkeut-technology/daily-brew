<?php
declare(strict_types=1);


namespace App\Repository;


use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Query\Parameter;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class AttendanceRepository
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
            ->innerJoin('a.employee', 'e')
            ->where('a.user = :user')
            ->andWhere('a.attendanceDate >= :from OR :from IS NULL')
            ->andWhere('a.attendanceDate <= :to OR :to IS NULL')
            ->setParameters(new ArrayCollection([
                new Parameter('user', $user),
                new Parameter('from', $from, Types::DATE_IMMUTABLE),
                new Parameter('to', $to, Types::DATE_IMMUTABLE),
            ]))
            ->getQuery()
            ->getResult();
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
            ->innerJoin('a.employee', 'e')
            ->where('a.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find attendances by employee and period.
     *
     * @param Employee $employee The employee for whom to find attendances.
     * @param DateTimeImmutable $from The start date of the period.
     * @param DateTimeImmutable $to The end date of the period.
     * @return Attendance[]
     */
    public function findByEmployeeAndPeriod(Employee $employee, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        return $this->createQueryBuilder('a')
            ->addSelect('e')
            ->innerJoin('a.employee', 'e')
            ->where('a.employee = :employee')
            ->andWhere('a.attendanceDate >= :from')
            ->andWhere('a.attendanceDate <= :to')
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
     * @param string $publicId The public ID of the attendance.
     * @param User|null $getUser The user associated with the attendance, or null if not applicable.
     * @return Attendance|null
     */
    public function findByPublicIdAndUser(string $publicId, ?User $getUser): ?Attendance
    {
        return $this->createQueryBuilder('a')
            ->addSelect('e')
            ->innerJoin('a.employee', 'e')
            ->where('a.publicId = :publicId')
            ->andWhere('a.user = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('publicId', $publicId),
                new Parameter('user', $getUser),
            ]))
            ->getQuery()
            ->getOneOrNullResult();
    }
}

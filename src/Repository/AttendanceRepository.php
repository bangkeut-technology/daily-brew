<?php
declare(strict_types=1);


namespace App\Repository;


use App\Entity\Attendance;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
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
            ->where('a.user = :user')
            ->andWhere('a.date >= :from OR :from IS NULL')
            ->andWhere('a.date <= :to OR :to IS NULL')
            ->setParameters(new ArrayCollection([
                new Parameter('user', $user),
                new Parameter('from', $from),
                new Parameter('to', $to),
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
            ->where('a.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }
}

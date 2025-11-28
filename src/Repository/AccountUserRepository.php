<?php
declare(strict_types=1);


namespace App\Repository;

use App\Entity\AccountUser;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class AccountUserRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<AccountUser>
 *
 * @method AccountUser      create()
 * @method AccountUser|null find($id, $lockMode = null, $lockVersion = null)
 * @method AccountUser|null findOneBy(array $criteria, array $orderBy = null)
 * @method AccountUser|null findByPublicId(string $publicId)
 * @method AccountUser[]    findAll()
 * @method AccountUser[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AccountUserRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AccountUser::class);
    }

    //    /**
    //     * @return AccountUser[] Returns an array of AccountUser objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('a')
    //            ->andWhere('a.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('a.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?AccountUser
    //    {
    //        return $this->createQueryBuilder('a')
    //            ->andWhere('a.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}

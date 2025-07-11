<?php
declare(strict_types=1);


namespace App\Repository;

use App\Entity\EmployeeEvaluation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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
 * @method EmployeeEvaluation[]    findAll()
 * @method EmployeeEvaluation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EmployeeEvaluationRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EmployeeEvaluation::class);
    }

    //    /**
    //     * @return EmployeeEvaluation[] Returns an array of EmployeeEvaluation objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('e.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?EmployeeEvaluation
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}

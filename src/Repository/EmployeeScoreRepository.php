<?php

namespace App\Repository;

use App\Entity\EmployeeScore;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class EmployeeScoreRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 * @extends ServiceEntityRepository<EmployeeScore>
 *
 * @method EmployeeScore      create()
 * @method EmployeeScore|null find($id, $lockMode = null, $lockVersion = null)
 * @method EmployeeScore|null findOneBy(array $criteria, array $orderBy = null)
 * @method EmployeeScore[]    findAll()
 * @method EmployeeScore[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EmployeeScoreRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EmployeeScore::class);
    }
}

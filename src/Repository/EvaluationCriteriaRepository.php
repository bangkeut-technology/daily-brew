<?php

namespace App\Repository;

use App\Entity\EvaluationCriteria;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class EvaluationCriteriaRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<EvaluationCriteria>
 *
 * @method EvaluationCriteria      create()
 * @method EvaluationCriteria|null find($id, $lockMode = null, $lockVersion = null)
 * @method EvaluationCriteria|null findOneBy(array $criteria, array $orderBy = null)
 * @method EvaluationCriteria[]    findAll()
 * @method EvaluationCriteria[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EvaluationCriteriaRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EvaluationCriteria::class);
    }
}

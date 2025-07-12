<?php
declare(strict_types=1);

namespace App\Repository;

use App\Entity\EvaluationTemplateCriteria;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class EvaluationTemplateCriteriaRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<EvaluationTemplateCriteria>
 *
 * @method EvaluationTemplateCriteria      create()
 * @method EvaluationTemplateCriteria|null find($id, $lockMode = null, $lockVersion = null)
 * @method EvaluationTemplateCriteria|null findOneBy(array $criteria, array $orderBy = null)
 * @method EvaluationTemplateCriteria[]    findAll()
 * @method EvaluationTemplateCriteria[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EvaluationTemplateCriteriaRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EvaluationTemplateCriteria::class);
    }
}

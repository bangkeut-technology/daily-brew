<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class ShiftTimeRuleRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends AbstractRepository<ShiftTimeRule>
 *
 * @method ShiftTimeRule      create()
 * @method ShiftTimeRule|null find($id, $lockMode = null, $lockVersion = null)
 * @method ShiftTimeRule|null findOneBy(array $criteria, array $orderBy = null)
 * @method ShiftTimeRule|null findByPublicId(string $publicId)
 * @method ShiftTimeRule[]    findAll()
 * @method ShiftTimeRule[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ShiftTimeRuleRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ShiftTimeRule::class);
    }

    public function findByPublicIdAndShift(string $publicId, Shift $shift): ?ShiftTimeRule
    {
        return $this->findOneBy(['publicId' => $publicId, 'shift' => $shift]);
    }
}

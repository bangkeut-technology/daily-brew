<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use App\Enum\DayOfWeekEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ShiftTimeRule>
 */
class ShiftTimeRuleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ShiftTimeRule::class);
    }

    /** @return ShiftTimeRule[] */
    public function findByShift(Shift $shift): array
    {
        return $this->findBy(['shift' => $shift], ['dayOfWeek' => 'ASC']);
    }

    public function findByShiftAndDayOfWeek(Shift $shift, DayOfWeekEnum $day): ?ShiftTimeRule
    {
        return $this->findOneBy(['shift' => $shift, 'dayOfWeek' => $day]);
    }
}

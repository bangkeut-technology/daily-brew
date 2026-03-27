<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use App\Enum\DayOfWeekEnum;
use Doctrine\ORM\EntityManagerInterface;

class ShiftTimeRuleService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function create(Shift $shift, DayOfWeekEnum $dayOfWeek, string $startTime, string $endTime): ShiftTimeRule
    {
        $rule = new ShiftTimeRule();
        $rule->setShift($shift);
        $rule->setDayOfWeek($dayOfWeek);
        $rule->setStartTime($startTime);
        $rule->setEndTime($endTime);

        $shift->addTimeRule($rule);
        $this->em->persist($rule);
        $this->em->flush();

        return $rule;
    }

    public function update(ShiftTimeRule $rule, string $startTime, string $endTime): ShiftTimeRule
    {
        $rule->setStartTime($startTime);
        $rule->setEndTime($endTime);
        $this->em->flush();

        return $rule;
    }

    public function delete(ShiftTimeRule $rule): void
    {
        $this->em->remove($rule);
        $this->em->flush();
    }
}

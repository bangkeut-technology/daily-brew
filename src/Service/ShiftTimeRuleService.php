<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use App\Enum\DayOfWeekEnum;
use App\Repository\ShiftTimeRuleRepository;

class ShiftTimeRuleService
{
    public function __construct(
        private ShiftTimeRuleRepository $shiftTimeRuleRepository,
    ) {}

    public function create(Shift $shift, DayOfWeekEnum $dayOfWeek, string $startTime, string $endTime): ShiftTimeRule
    {
        $rule = new ShiftTimeRule();
        $rule->setShift($shift);
        $rule->setDayOfWeek($dayOfWeek);
        $rule->setStartTime($startTime);
        $rule->setEndTime($endTime);

        $shift->addTimeRule($rule);
        $this->shiftTimeRuleRepository->persist($rule);
        $this->shiftTimeRuleRepository->flush();

        return $rule;
    }

    public function update(ShiftTimeRule $rule, string $startTime, string $endTime): ShiftTimeRule
    {
        $rule->setStartTime($startTime);
        $rule->setEndTime($endTime);
        $this->shiftTimeRuleRepository->flush();

        return $rule;
    }

    public function delete(ShiftTimeRule $rule): void
    {
        $this->shiftTimeRuleRepository->delete($rule);
    }
}

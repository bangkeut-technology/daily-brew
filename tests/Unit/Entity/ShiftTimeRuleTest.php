<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use App\Enum\DayOfWeekEnum;
use PHPUnit\Framework\TestCase;

class ShiftTimeRuleTest extends TestCase
{
    public function testFieldsRoundTrip(): void
    {
        $shift = new Shift();
        $rule = (new ShiftTimeRule())
            ->setShift($shift)
            ->setDayOfWeek(DayOfWeekEnum::Friday)
            ->setStartTime('11:00')
            ->setEndTime('23:00');

        $this->assertSame($shift, $rule->getShift());
        $this->assertSame(DayOfWeekEnum::Friday, $rule->getDayOfWeek());
        $this->assertSame('11:00', $rule->getStartTime());
        $this->assertSame('23:00', $rule->getEndTime());
    }

    public function testShiftRelationshipCanBeCleared(): void
    {
        $rule = (new ShiftTimeRule())->setShift(new Shift());

        $rule->setShift(null);

        $this->assertNull($rule->getShift());
    }
}

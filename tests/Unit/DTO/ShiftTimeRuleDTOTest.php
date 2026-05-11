<?php

declare(strict_types=1);

namespace App\Tests\Unit\DTO;

use App\DTO\ShiftTimeRuleDTO;
use App\Entity\ShiftTimeRule;
use App\Enum\DayOfWeekEnum;
use PHPUnit\Framework\TestCase;

class ShiftTimeRuleDTOTest extends TestCase
{
    public function testFromEntityExposesDayOfWeekIntegerAndHumanLabel(): void
    {
        $rule = (new ShiftTimeRule())
            ->setDayOfWeek(DayOfWeekEnum::Friday)
            ->setStartTime('11:00')
            ->setEndTime('23:00');

        $dto = ShiftTimeRuleDTO::fromEntity($rule);

        $this->assertSame(5, $dto->dayOfWeek);
        $this->assertSame('Friday', $dto->dayOfWeekLabel);
        $this->assertSame('11:00', $dto->startTime);
        $this->assertSame('23:00', $dto->endTime);
    }

    public function testToArrayContainsEveryField(): void
    {
        $rule = (new ShiftTimeRule())
            ->setDayOfWeek(DayOfWeekEnum::Monday)
            ->setStartTime('09:00')
            ->setEndTime('17:00');

        $arr = ShiftTimeRuleDTO::fromEntity($rule)->toArray();

        $this->assertSame(
            ['publicId', 'dayOfWeek', 'dayOfWeekLabel', 'startTime', 'endTime'],
            array_keys($arr),
        );
        $this->assertSame(1, $arr['dayOfWeek']);
        $this->assertSame('Monday', $arr['dayOfWeekLabel']);
    }
}

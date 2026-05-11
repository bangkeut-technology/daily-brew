<?php

declare(strict_types=1);

namespace App\Tests\Unit\DTO;

use App\DTO\ShiftDTO;
use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use App\Enum\DayOfWeekEnum;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

class ShiftDTOTest extends TestCase
{
    public function testFromEntityFormatsTimesAndCopiesGracePeriods(): void
    {
        $shift = (new Shift())
            ->setName('Morning')
            ->setStartTime(new DateTimeImmutable('09:00:00'))
            ->setEndTime(new DateTimeImmutable('17:00:00'))
            ->setGraceLateMinutes(5)
            ->setGraceEarlyMinutes(10);

        $dto = ShiftDTO::fromEntity($shift);

        $this->assertSame('Morning', $dto->name);
        $this->assertSame('09:00', $dto->startTime);
        $this->assertSame('17:00', $dto->endTime);
        $this->assertSame(5, $dto->graceLateMinutes);
        $this->assertSame(10, $dto->graceEarlyMinutes);
        $this->assertSame([], $dto->timeRules);
    }

    public function testFromEntityLeavesStartEndNullWhenUnset(): void
    {
        $shift = (new Shift())->setName('Flexible');

        $dto = ShiftDTO::fromEntity($shift);

        $this->assertNull($dto->startTime);
        $this->assertNull($dto->endTime);
    }

    public function testFromEntitySerialisesTimeRulesAsArrays(): void
    {
        $shift = (new Shift())->setName('Weekend');
        $rule = (new ShiftTimeRule())
            ->setDayOfWeek(DayOfWeekEnum::Friday)
            ->setStartTime('11:00')
            ->setEndTime('23:00');
        $shift->addTimeRule($rule);

        $dto = ShiftDTO::fromEntity($shift);

        $this->assertCount(1, $dto->timeRules);
        $this->assertSame(5, $dto->timeRules[0]['dayOfWeek']);
        $this->assertSame('Friday', $dto->timeRules[0]['dayOfWeekLabel']);
        $this->assertSame('11:00', $dto->timeRules[0]['startTime']);
    }

    public function testToArrayContainsEveryField(): void
    {
        $shift = (new Shift())->setName('Morning');

        $arr = ShiftDTO::fromEntity($shift)->toArray();

        $this->assertSame(
            ['publicId', 'name', 'startTime', 'endTime', 'graceLateMinutes', 'graceEarlyMinutes', 'timeRules'],
            array_keys($arr),
        );
    }
}

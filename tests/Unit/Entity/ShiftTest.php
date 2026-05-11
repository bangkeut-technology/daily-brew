<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use App\Enum\DayOfWeekEnum;
use DateTimeImmutable;
use Doctrine\Common\Collections\Collection;
use PHPUnit\Framework\TestCase;

class ShiftTest extends TestCase
{
    public function testConstructorInitializesCollectionsAndZeroGrace(): void
    {
        $shift = new Shift();

        $this->assertInstanceOf(Collection::class, $shift->getTimeRules());
        $this->assertInstanceOf(Collection::class, $shift->getEmployees());
        $this->assertCount(0, $shift->getTimeRules());

        // Grace periods default to 0 — owner has to opt in to leniency.
        $this->assertSame(0, $shift->getGraceLateMinutes());
        $this->assertSame(0, $shift->getGraceEarlyMinutes());
    }

    public function testStartAndEndTimeRoundTrip(): void
    {
        $start = new DateTimeImmutable('09:00:00');
        $end = new DateTimeImmutable('17:00:00');
        $shift = (new Shift())->setStartTime($start)->setEndTime($end);

        $this->assertSame($start, $shift->getStartTime());
        $this->assertSame($end, $shift->getEndTime());
    }

    public function testGracePeriodsRoundTrip(): void
    {
        $shift = (new Shift())
            ->setGraceLateMinutes(5)
            ->setGraceEarlyMinutes(10);

        $this->assertSame(5, $shift->getGraceLateMinutes());
        $this->assertSame(10, $shift->getGraceEarlyMinutes());
    }

    public function testAddTimeRuleStoresAndReturnsFluentReference(): void
    {
        $shift = new Shift();
        $rule = (new ShiftTimeRule())->setDayOfWeek(DayOfWeekEnum::Friday);

        $shift->addTimeRule($rule);

        $this->assertTrue($shift->getTimeRules()->contains($rule));
    }

    public function testRemoveTimeRuleClearsBackReference(): void
    {
        $shift = new Shift();
        $rule = new ShiftTimeRule();
        $shift->addTimeRule($rule);

        $shift->removeTimeRule($rule);

        $this->assertFalse($shift->getTimeRules()->contains($rule));
    }

    public function testToStringReturnsName(): void
    {
        $shift = (new Shift())->setName('Morning');

        $this->assertSame('Morning', (string) $shift);
    }
}

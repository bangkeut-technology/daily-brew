<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Shift;

use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use App\Entity\Workspace;
use App\Enum\DayOfWeekEnum;
use App\Service\PlanService;
use App\Service\Shift\ResolvedShiftTimes;
use App\Service\Shift\ShiftScheduleResolver;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;

class ShiftScheduleResolverTest extends TestCase
{
    private PlanService&Stub $planService;
    private ShiftScheduleResolver $resolver;

    protected function setUp(): void
    {
        $this->planService = $this->createStub(PlanService::class);
        $this->resolver = new ShiftScheduleResolver($this->planService);
    }

    public function testEndBeforeStartMeansTheShiftRunsIntoTheNextDay(): void
    {
        $times = new ResolvedShiftTimes('18:00', '02:00');

        $this->assertTrue($times->crossesMidnight());
        $this->assertSame(1080, $times->startMinutes());
        $this->assertSame(1560, $times->endMinutes(), '02:00 the next day is 26:00 from the shift day');
    }

    public function testADayShiftKeepsBothEndsInsideTheSameDay(): void
    {
        $times = new ResolvedShiftTimes('09:00', '17:00');

        $this->assertFalse($times->crossesMidnight());
        $this->assertSame(1020, $times->endMinutes());
    }

    public function testEqualStartAndEndIsTreatedAsSameDay(): void
    {
        // Degenerate, but it's what the pre-existing comparison did — a shift
        // configured 09:00–09:00 must not silently become a 24-hour one.
        $times = new ResolvedShiftTimes('09:00', '09:00');

        $this->assertFalse($times->crossesMidnight());
        $this->assertSame(540, $times->endMinutes());
    }

    public function testAMissingEndTimeYieldsNoEndMinutes(): void
    {
        $times = new ResolvedShiftTimes('09:00', null);

        $this->assertFalse($times->crossesMidnight());
        $this->assertNull($times->endMinutes());
        $this->assertSame(540, $times->startMinutes());
    }

    public function testFallsBackToTheShiftDefaultsWithoutPerDayRules(): void
    {
        $times = $this->resolver->resolveFor($this->overnightShift(), new DateTimeImmutable('2026-04-10'));

        $this->assertNotNull($times);
        $this->assertSame('18:00', $times->startTime);
        $this->assertSame('02:00', $times->endTime);
    }

    public function testPerDayRulesAreIgnoredWhenThePlanDoesNotIncludeThem(): void
    {
        $this->planService->method('canUseShiftTimeRules')->willReturn(false);
        $shift = $this->overnightShift();
        $shift->addTimeRule(
            (new ShiftTimeRule())->setDayOfWeek(DayOfWeekEnum::Friday)->setStartTime('08:00')->setEndTime('16:00')
        );

        // 2026-04-10 is a Friday, but the workspace is on Free — defaults win.
        $times = $this->resolver->resolveFor($shift, new DateTimeImmutable('2026-04-10'));

        $this->assertSame('02:00', $times?->endTime);
    }

    public function testAnUnscheduledDayResolvesToNothing(): void
    {
        $this->planService->method('canUseShiftTimeRules')->willReturn(true);
        $shift = $this->overnightShift();
        $shift->addTimeRule(
            (new ShiftTimeRule())->setDayOfWeek(DayOfWeekEnum::Friday)->setStartTime('18:00')->setEndTime('02:00')
        );

        // Saturday has no rule — the shift simply doesn't run, and callers must
        // not fall back to the defaults (that's the off-day GM regression).
        $this->assertNull($this->resolver->resolveFor($shift, new DateTimeImmutable('2026-04-11')));
    }

    private function overnightShift(): Shift
    {
        return (new Shift())
            ->setWorkspace(new Workspace())
            ->setStartTime(new DateTimeImmutable('18:00:00'))
            ->setEndTime(new DateTimeImmutable('02:00:00'));
    }
}

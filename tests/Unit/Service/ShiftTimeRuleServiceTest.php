<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Shift;
use App\Entity\ShiftTimeRule;
use App\Enum\DayOfWeekEnum;
use App\Repository\ShiftTimeRuleRepository;
use App\Service\ShiftTimeRuleService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ShiftTimeRuleServiceTest extends TestCase
{
    private ShiftTimeRuleRepository&MockObject $repo;
    private ShiftTimeRuleService $svc;

    protected function setUp(): void
    {
        $this->repo = $this->createMock(ShiftTimeRuleRepository::class);
        $this->svc = new ShiftTimeRuleService($this->repo);
    }

    public function testCreateAttachesRuleToShiftAndPersists(): void
    {
        $shift = new Shift();
        $this->repo->expects($this->once())
            ->method('persist')
            ->with($this->isInstanceOf(ShiftTimeRule::class));
        $this->repo->expects($this->once())->method('flush');

        $rule = $this->svc->create($shift, DayOfWeekEnum::Friday, '11:00', '23:00');

        $this->assertSame($shift, $rule->getShift());
        $this->assertSame(DayOfWeekEnum::Friday, $rule->getDayOfWeek());
        $this->assertSame('11:00', $rule->getStartTime());
        $this->assertSame('23:00', $rule->getEndTime());
        $this->assertTrue($shift->getTimeRules()->contains($rule));
    }

    public function testUpdateChangesTimesAndFlushes(): void
    {
        $rule = (new ShiftTimeRule())->setStartTime('09:00')->setEndTime('17:00');
        $this->repo->expects($this->never())->method('persist');
        $this->repo->expects($this->once())->method('flush');

        $result = $this->svc->update($rule, '10:00', '18:30');

        $this->assertSame('10:00', $result->getStartTime());
        $this->assertSame('18:30', $result->getEndTime());
    }

    public function testDeleteDelegatesToRepository(): void
    {
        $rule = new ShiftTimeRule();
        $this->repo->expects($this->once())->method('delete')->with($rule);

        $this->svc->delete($rule);
    }
}

<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Shift;
use App\Entity\Workspace;
use App\Repository\ShiftRepository;
use App\Service\ShiftService;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ShiftServiceTest extends TestCase
{
    private ShiftRepository&MockObject $repo;
    private ShiftService $svc;

    protected function setUp(): void
    {
        $this->repo = $this->createMock(ShiftRepository::class);
        $this->svc = new ShiftService($this->repo);
    }

    public function testCreatePersistsShiftWithProvidedFields(): void
    {
        $workspace = new Workspace();
        $start = new DateTimeImmutable('09:00:00');
        $end = new DateTimeImmutable('17:00:00');

        $this->repo->expects($this->once())
            ->method('update')
            ->with($this->callback(function (Shift $shift) use ($workspace, $start, $end): bool {
                return $shift->getWorkspace() === $workspace
                    && $shift->getName() === 'Morning'
                    && $shift->getStartTime() === $start
                    && $shift->getEndTime() === $end;
            }));

        $result = $this->svc->create($workspace, 'Morning', $start, $end);

        $this->assertSame($workspace, $result->getWorkspace());
        $this->assertSame('Morning', $result->getName());
    }

    public function testUpdateMutatesNameAndTimesAndPersists(): void
    {
        $shift = (new Shift())->setName('Old')->setStartTime(new DateTimeImmutable('08:00:00'));
        $newStart = new DateTimeImmutable('10:00:00');
        $newEnd = new DateTimeImmutable('18:00:00');

        $this->repo->expects($this->once())->method('update')->with($shift);

        $result = $this->svc->update($shift, 'Evening', $newStart, $newEnd);

        $this->assertSame('Evening', $result->getName());
        $this->assertSame($newStart, $result->getStartTime());
        $this->assertSame($newEnd, $result->getEndTime());
    }

    public function testDeleteDelegatesToRepository(): void
    {
        $shift = new Shift();
        $this->repo->expects($this->once())->method('delete')->with($shift);

        $this->svc->delete($shift);
    }
}

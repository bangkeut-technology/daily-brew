<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\ClosurePeriod;
use App\Entity\Workspace;
use App\Repository\ClosurePeriodRepository;
use App\Service\ClosurePeriodService;
use App\Service\NotificationService;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ClosurePeriodServiceTest extends TestCase
{
    private ClosurePeriodRepository&MockObject $repo;
    private NotificationService&MockObject $notifications;
    private ClosurePeriodService $svc;

    protected function setUp(): void
    {
        $this->repo = $this->createMock(ClosurePeriodRepository::class);
        $this->notifications = $this->createMock(NotificationService::class);
        $this->svc = new ClosurePeriodService($this->repo, $this->notifications);
    }

    public function testCreatePersistsAndNotifiesLinkedEmployees(): void
    {
        $workspace = new Workspace();
        $start = new DateTimeImmutable('2026-04-14');
        $end = new DateTimeImmutable('2026-04-16');

        $captured = null;
        $this->repo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (ClosurePeriod $c) use (&$captured): bool {
                $captured = $c;
                return true;
            }));
        $this->repo->expects($this->once())->method('flush');
        $this->notifications->expects($this->once())
            ->method('notifyClosureCreated')
            ->with($this->isInstanceOf(ClosurePeriod::class));

        $result = $this->svc->create($workspace, 'Khmer New Year', $start, $end);

        $this->assertSame($workspace, $result->getWorkspace());
        $this->assertSame('Khmer New Year', $result->getName());
        $this->assertSame($start, $result->getStartDate());
        $this->assertSame($end, $result->getEndDate());
        $this->assertSame($result, $captured);
    }

    public function testUpdateMutatesFieldsAndFlushesWithoutNotifying(): void
    {
        $closure = (new ClosurePeriod())->setName('Old name');
        $newStart = new DateTimeImmutable('2026-05-01');
        $newEnd = new DateTimeImmutable('2026-05-03');

        $this->repo->expects($this->never())->method('persist');
        $this->repo->expects($this->once())->method('flush');
        $this->notifications->expects($this->never())->method('notifyClosureCreated');

        $result = $this->svc->update($closure, 'Labour Day', $newStart, $newEnd);

        $this->assertSame('Labour Day', $result->getName());
        $this->assertSame($newStart, $result->getStartDate());
        $this->assertSame($newEnd, $result->getEndDate());
    }

    public function testDeleteDelegatesToRepository(): void
    {
        $closure = new ClosurePeriod();
        $this->repo->expects($this->once())->method('delete')->with($closure);
        $this->notifications->expects($this->never())->method('notifyClosureCreated');

        $this->svc->delete($closure);
    }
}

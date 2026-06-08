<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Attendance;

use App\Entity\Attendance;
use App\Entity\ClosurePeriod;
use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Enum\LeaveTypeEnum;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\Attendance\AttendanceRowBuilder;
use App\Service\DateService;
use DateTimeImmutable;
use DateTimeZone;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

class AttendanceRowBuilderTest extends TestCase
{
    private AttendanceRepository&Stub $attendances;
    private LeaveRequestRepository&Stub $leaves;
    private ClosurePeriodRepository&Stub $closures;
    private AttendanceRowBuilder $builder;

    protected function setUp(): void
    {
        $this->attendances = $this->createStub(AttendanceRepository::class);
        $this->leaves = $this->createStub(LeaveRequestRepository::class);
        $this->closures = $this->createStub(ClosurePeriodRepository::class);
        $this->builder = new AttendanceRowBuilder($this->attendances, $this->leaves, $this->closures);

        DateService::setClock(new MockClock('2026-05-31 23:00:00', new DateTimeZone('UTC')));
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
    }

    public function testEmployeeLinkedMidMonthOnlyHasRowsFromLinkDateOnward(): void
    {
        // 5-day window 2026-05-10 to 2026-05-14. Employee linked 2026-05-12.
        // Expected: 3 absent rows for 12, 13, 14 — nothing before 12.
        $ws = $this->workspace();
        $emp = $this->employee(linkedAt: new DateTimeImmutable('2026-05-12 10:00:00'));

        $this->attendances->method('findByWorkspaceAndDateRange')->willReturn([]);
        $this->leaves->method('findApprovedByWorkspaceAndDateRange')->willReturn([]);
        $this->closures->method('findAllOverlappingRange')->willReturn([]);

        $rows = $this->builder->build(
            $ws,
            [$emp],
            new DateTimeImmutable('2026-05-10'),
            new DateTimeImmutable('2026-05-14'),
        );

        $dates = array_column($rows, 'date');
        $this->assertSame(['2026-05-12', '2026-05-13', '2026-05-14'], $dates);
        foreach ($rows as $r) {
            $this->assertSame('absent', $r['status']);
        }
    }

    public function testNeverLinkedEmployeeProducesNoRows(): void
    {
        $ws = $this->workspace();
        $emp = $this->employee(linkedAt: null);

        $this->attendances->method('findByWorkspaceAndDateRange')->willReturn([]);
        $this->leaves->method('findApprovedByWorkspaceAndDateRange')->willReturn([]);
        $this->closures->method('findAllOverlappingRange')->willReturn([]);

        $rows = $this->builder->build(
            $ws,
            [$emp],
            new DateTimeImmutable('2026-05-10'),
            new DateTimeImmutable('2026-05-14'),
        );

        $this->assertSame([], $rows);
    }

    public function testLeftAtExcludesDaysAfterDeactivation(): void
    {
        // Linked on day 1, deactivated end-of-day 2 → only days 1, 2 produce rows.
        $ws = $this->workspace();
        $emp = $this->employee(
            linkedAt: new DateTimeImmutable('2026-05-10 09:00:00'),
            leftAt: new DateTimeImmutable('2026-05-11 18:00:00'),
        );

        $this->attendances->method('findByWorkspaceAndDateRange')->willReturn([]);
        $this->leaves->method('findApprovedByWorkspaceAndDateRange')->willReturn([]);
        $this->closures->method('findAllOverlappingRange')->willReturn([]);

        $rows = $this->builder->build(
            $ws,
            [$emp],
            new DateTimeImmutable('2026-05-10'),
            new DateTimeImmutable('2026-05-14'),
        );

        $this->assertSame(['2026-05-10', '2026-05-11'], array_column($rows, 'date'));
    }

    public function testClosureSkipsAbsentRow(): void
    {
        $ws = $this->workspace();
        $emp = $this->employee(linkedAt: new DateTimeImmutable('2026-05-01'));
        $closure = $this->closure('2026-05-11', '2026-05-12');

        $this->attendances->method('findByWorkspaceAndDateRange')->willReturn([]);
        $this->leaves->method('findApprovedByWorkspaceAndDateRange')->willReturn([]);
        $this->closures->method('findAllOverlappingRange')->willReturn([$closure]);

        $rows = $this->builder->build(
            $ws,
            [$emp],
            new DateTimeImmutable('2026-05-10'),
            new DateTimeImmutable('2026-05-13'),
        );

        // Day 10 + 13 absent, 11 + 12 closure → no rows
        $this->assertSame(['2026-05-10', '2026-05-13'], array_column($rows, 'date'));
    }

    public function testApprovedLeaveMarksRowAsOnLeave(): void
    {
        $ws = $this->workspace();
        $emp = $this->employee(linkedAt: new DateTimeImmutable('2026-05-01'));
        $leave = $this->leave($emp, '2026-05-11', '2026-05-11');

        $this->attendances->method('findByWorkspaceAndDateRange')->willReturn([]);
        $this->leaves->method('findApprovedByWorkspaceAndDateRange')->willReturn([$leave]);
        $this->closures->method('findAllOverlappingRange')->willReturn([]);

        $rows = $this->builder->build(
            $ws,
            [$emp],
            new DateTimeImmutable('2026-05-10'),
            new DateTimeImmutable('2026-05-12'),
        );

        $byDate = [];
        foreach ($rows as $r) {
            $byDate[$r['date']] = $r['status'];
        }
        $this->assertSame('absent', $byDate['2026-05-10']);
        $this->assertSame('on_leave', $byDate['2026-05-11']);
        $this->assertSame('absent', $byDate['2026-05-12']);
    }

    public function testAttendanceRecordProducesPresentRow(): void
    {
        $ws = $this->workspace();
        $emp = $this->employee(linkedAt: new DateTimeImmutable('2026-05-01'));
        $a = $this->attendance(
            $emp,
            '2026-05-11',
            checkIn: new DateTimeImmutable('2026-05-11 08:55:00'),
            checkOut: new DateTimeImmutable('2026-05-11 17:05:00'),
        );

        $this->attendances->method('findByWorkspaceAndDateRange')->willReturn([$a]);
        $this->leaves->method('findApprovedByWorkspaceAndDateRange')->willReturn([]);
        $this->closures->method('findAllOverlappingRange')->willReturn([]);

        $rows = $this->builder->build(
            $ws,
            [$emp],
            new DateTimeImmutable('2026-05-11'),
            new DateTimeImmutable('2026-05-11'),
        );

        $this->assertCount(1, $rows);
        $this->assertSame('present', $rows[0]['status']);
        $this->assertSame('08:55', $rows[0]['checkInAt']);
        $this->assertSame('17:05', $rows[0]['checkOutAt']);
    }

    public function testFutureDaysDontProduceAbsentRows(): void
    {
        // "Today" pinned to 2026-05-31 in setUp. Future days should not show absent.
        $ws = $this->workspace();
        $emp = $this->employee(linkedAt: new DateTimeImmutable('2026-05-01'));

        $this->attendances->method('findByWorkspaceAndDateRange')->willReturn([]);
        $this->leaves->method('findApprovedByWorkspaceAndDateRange')->willReturn([]);
        $this->closures->method('findAllOverlappingRange')->willReturn([]);

        $rows = $this->builder->build(
            $ws,
            [$emp],
            new DateTimeImmutable('2026-05-30'),
            new DateTimeImmutable('2026-06-02'),
        );

        // Only 30 + 31 are absent; June 1 + 2 are future → no rows
        $this->assertSame(['2026-05-30', '2026-05-31'], array_column($rows, 'date'));
    }

    // ── Helpers ────────────────────────────────────────────────────────

    private function workspace(): Workspace
    {
        $ws = new Workspace();
        $setting = new WorkspaceSetting();
        $setting->setTimezone('UTC');
        $ws->setSetting($setting);
        $this->setEntityId($ws, 1);
        return $ws;
    }

    private function employee(
        ?DateTimeImmutable $linkedAt,
        ?DateTimeImmutable $leftAt = null,
        int $id = 100,
    ): Employee {
        $emp = new Employee();
        $emp->setFirstName('Test');
        $emp->setLastName('Person');
        $emp->setLinkedAt($linkedAt);
        if ($leftAt !== null) {
            $emp->setLeftAt($leftAt);
        }
        $this->setEntityId($emp, $id);
        return $emp;
    }

    private function attendance(
        Employee $emp,
        string $date,
        ?DateTimeImmutable $checkIn = null,
        ?DateTimeImmutable $checkOut = null,
    ): Attendance {
        $a = new Attendance();
        $a->setEmployee($emp);
        $a->setDate(new DateTimeImmutable($date));
        if ($checkIn !== null) {
            $a->setCheckInAt($checkIn);
        }
        if ($checkOut !== null) {
            $a->setCheckOutAt($checkOut);
        }
        $this->setEntityId($a, mt_rand(1, 9999));
        return $a;
    }

    private function leave(Employee $emp, string $start, string $end): LeaveRequest
    {
        $lr = new LeaveRequest();
        $lr->setEmployee($emp);
        $lr->setStartDate(new DateTimeImmutable($start));
        $lr->setEndDate(new DateTimeImmutable($end));
        $lr->setType(LeaveTypeEnum::PAID);
        return $lr;
    }

    private function closure(string $start, string $end): ClosurePeriod
    {
        $c = new ClosurePeriod();
        $c->setStartDate(new DateTimeImmutable($start));
        $c->setEndDate(new DateTimeImmutable($end));
        return $c;
    }

    private function setEntityId(object $entity, int $id): void
    {
        $ref = new \ReflectionClass($entity);
        while ($ref !== false && !$ref->hasProperty('id')) {
            $ref = $ref->getParentClass();
        }
        if ($ref === false) {
            throw new \LogicException('No id property on ' . get_class($entity));
        }
        $ref->getProperty('id')->setValue($entity, $id);
    }
}

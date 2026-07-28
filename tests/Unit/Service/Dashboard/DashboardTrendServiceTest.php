<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Dashboard;

use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Service\Attendance\AttendanceSummaryBuilder;
use App\Service\Dashboard\DashboardTrendService;
use App\Service\DateService;
use DateTimeImmutable;
use DateTimeZone;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

class DashboardTrendServiceTest extends TestCase
{
    private AttendanceSummaryBuilder&Stub $summaryBuilder;
    private DashboardTrendService $svc;

    protected function setUp(): void
    {
        // Tuesday 2026-07-28. The 3-day window is Sun 26 → Tue 28, with
        // Thu 23 → Sat 25 as the previous period.
        DateService::setClock(new MockClock(new DateTimeImmutable('2026-07-28 10:00:00', new DateTimeZone('UTC'))));
        $this->summaryBuilder = $this->createStub(AttendanceSummaryBuilder::class);
        $this->svc = new DashboardTrendService($this->summaryBuilder);
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
    }

    public function testDailySeriesSplitsPresentIntoOnTimeAndLate(): void
    {
        $this->summaryBuilder->method('build')->willReturn($this->grid());

        $result = $this->svc->build($this->workspace(), [], 3);

        $this->assertSame('2026-07-26', $result['from']);
        $this->assertSame('2026-07-28', $result['to']);
        $this->assertCount(3, $result['daily']);

        [$sun, $mon, $tue] = $result['daily'];

        // Sunday: Ann late, Bo absent.
        $this->assertSame(['2026-07-26', 0, 1, 0, 1], [$sun['date'], $sun['onTime'], $sun['late'], $sun['leave'], $sun['absent']]);
        $this->assertSame(50, $sun['attendanceRate'], '1 present of 2 expected');
        $this->assertSame(0, $sun['onTimeRate']);

        // Monday: Ann on time, Bo on leave — leave stays out of the denominator.
        $this->assertSame(['2026-07-27', 1, 0, 1, 0], [$mon['date'], $mon['onTime'], $mon['late'], $mon['leave'], $mon['absent']]);
        $this->assertSame(1, $mon['expected']);
        $this->assertSame(100, $mon['attendanceRate']);

        // Tuesday: Ann on time, Bo late.
        $this->assertSame(['2026-07-28', 1, 1, 0, 0], [$tue['date'], $tue['onTime'], $tue['late'], $tue['leave'], $tue['absent']]);
        $this->assertSame(50, $tue['onTimeRate']);
    }

    public function testTotalsCoverOnlyTheCurrentWindowAndCarryPreviousPeriodRates(): void
    {
        $this->summaryBuilder->method('build')->willReturn($this->grid());

        $totals = $this->svc->build($this->workspace(), [], 3)['totals'];

        $this->assertSame(2, $totals['onTime']);
        $this->assertSame(2, $totals['late']);
        $this->assertSame(1, $totals['leave']);
        $this->assertSame(1, $totals['absent']);
        $this->assertSame(80, $totals['attendanceRate'], '4 present of 5 expected');
        $this->assertSame(50, $totals['onTimeRate'], '2 on time of 4 present');
        // Ann's Thu-Sat half: 1 on time, 1 late, 1 absent.
        $this->assertSame(67, $totals['previousAttendanceRate']);
        $this->assertSame(50, $totals['previousOnTimeRate']);
    }

    public function testTopLateRanksByLateCountThenRate(): void
    {
        $this->summaryBuilder->method('build')->willReturn($this->grid());

        $topLate = $this->svc->build($this->workspace(), [], 3)['topLate'];

        $this->assertCount(2, $topLate, 'employees with no late days are omitted');
        // Both were late once, so the rate breaks the tie: Bo's single day was
        // his only shift, Ann's was one of three.
        $this->assertSame('pub-bo', $topLate[0]['employeePublicId']);
        $this->assertSame([1, 1, 100], [$topLate[0]['late'], $topLate[0]['present'], $topLate[0]['lateRate']]);
        $this->assertSame('pub-ann', $topLate[1]['employeePublicId']);
        $this->assertSame([1, 3, 33], [$topLate[1]['late'], $topLate[1]['present'], $topLate[1]['lateRate']]);
    }

    public function testByWeekdayIsMondayFirstAndFlagsDaysWithoutData(): void
    {
        $this->summaryBuilder->method('build')->willReturn($this->grid());

        $byWeekday = $this->svc->build($this->workspace(), [], 3)['byWeekday'];

        $this->assertCount(7, $byWeekday);
        $this->assertSame([1, 2, 3, 4, 5, 6, 7], array_column($byWeekday, 'dayOfWeek'));

        $monday = $byWeekday[0];
        $this->assertTrue($monday['hasData']);
        $this->assertSame(100, $monday['onTimeRate']);

        $wednesday = $byWeekday[2];
        $this->assertFalse($wednesday['hasData'], 'no Wednesday inside a Sun-Tue window');
        $this->assertSame(0, $wednesday['onTimeRate']);
    }

    public function testFullyClosedDaysAreFlaggedAndExpectNobody(): void
    {
        $this->summaryBuilder->method('build')->willReturn([
            [
                'employeePublicId' => 'pub-ann',
                'employeeName' => 'Ann',
                'shiftName' => null,
                'days' => [
                    ['date' => '2026-07-26', 'status' => 'closure'],
                    ['date' => '2026-07-27', 'status' => 'off'],
                    ['date' => '2026-07-28', 'status' => 'voided'],
                ],
            ],
        ]);

        $daily = $this->svc->build($this->workspace(), [], 3)['daily'];

        $this->assertTrue($daily[0]['closed']);
        $this->assertSame(0, $daily[0]['expected']);
        // 'off' and 'voided' are neither an expectation nor a miss, and neither
        // closes the restaurant.
        $this->assertFalse($daily[1]['closed']);
        $this->assertSame(0, $daily[1]['expected']);
        $this->assertFalse($daily[2]['closed']);
        $this->assertSame(0, $daily[2]['expected']);
    }

    public function testDaysOutsideTheGridStillProduceAnEvenTimeAxis(): void
    {
        $this->summaryBuilder->method('build')->willReturn([]);

        $result = $this->svc->build($this->workspace(), [], 3);

        $this->assertSame(
            ['2026-07-26', '2026-07-27', '2026-07-28'],
            array_column($result['daily'], 'date'),
        );
        $this->assertSame(0, $result['totals']['attendanceRate']);
        $this->assertSame([], $result['topLate']);
    }

    public function testDaysParameterIsClampedToTheSupportedWindow(): void
    {
        $this->summaryBuilder->method('build')->willReturn([]);

        $this->assertCount(DashboardTrendService::MAX_DAYS, $this->svc->build($this->workspace(), [], 365)['daily']);
        $this->assertCount(1, $this->svc->build($this->workspace(), [], 0)['daily']);
    }

    /**
     * Ann spans both halves of the window; Bo only the current one.
     *
     * @return list<array<string, mixed>>
     */
    private function grid(): array
    {
        return [
            [
                'employeePublicId' => 'pub-ann',
                'employeeName' => 'Ann',
                'shiftName' => 'Morning',
                'days' => [
                    ['date' => '2026-07-23', 'status' => 'present', 'isLate' => false],
                    ['date' => '2026-07-24', 'status' => 'present', 'isLate' => true],
                    ['date' => '2026-07-25', 'status' => 'absent'],
                    ['date' => '2026-07-26', 'status' => 'present', 'isLate' => true],
                    ['date' => '2026-07-27', 'status' => 'present', 'isLate' => false],
                    ['date' => '2026-07-28', 'status' => 'present', 'isLate' => false],
                ],
            ],
            [
                'employeePublicId' => 'pub-bo',
                'employeeName' => 'Bo',
                'shiftName' => null,
                'days' => [
                    ['date' => '2026-07-26', 'status' => 'absent'],
                    ['date' => '2026-07-27', 'status' => 'leave', 'leaveType' => 'paid'],
                    ['date' => '2026-07-28', 'status' => 'present', 'isLate' => true],
                ],
            ],
        ];
    }

    private function workspace(): Workspace
    {
        $workspace = new Workspace();
        $workspace->setSetting((new WorkspaceSetting())->setTimezone('UTC'));

        return $workspace;
    }
}

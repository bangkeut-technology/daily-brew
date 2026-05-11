<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Service\DateService;
use DateTimeImmutable;
use DateTimeZone;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

class DateServiceClockSeamTest extends TestCase
{
    protected function tearDown(): void
    {
        // Critical — leaving a mocked clock installed would freeze "now" for every
        // subsequent test in the suite.
        DateService::setClock(null);
        parent::tearDown();
    }

    public function testSetClockPinsNowToTheMockedInstant(): void
    {
        DateService::setClock(new MockClock('2026-04-10 09:30:00', new DateTimeZone('UTC')));

        $now = DateService::now();

        $this->assertSame('2026-04-10 09:30:00', $now->format('Y-m-d H:i:s'));
        $this->assertSame('UTC', $now->getTimezone()->getName());
    }

    public function testNowAlwaysReturnsUtcEvenWhenClockIsInAnotherTimezone(): void
    {
        DateService::setClock(new MockClock('2026-04-10 16:30:00', new DateTimeZone('Asia/Phnom_Penh')));

        $now = DateService::now();

        // 16:30 in +07:00 → 09:30 UTC
        $this->assertSame('UTC', $now->getTimezone()->getName());
        $this->assertSame('09:30:00', $now->format('H:i:s'));
    }

    public function testTodayReturnsMidnightOfTheMockedDayInRequestedTimezone(): void
    {
        DateService::setClock(new MockClock('2026-04-10 23:45:00', new DateTimeZone('UTC')));

        // 23:45 UTC → 06:45 next morning in Phnom Penh (UTC+7), so "today" there is the 11th.
        $today = DateService::today(new DateTimeZone('Asia/Phnom_Penh'));

        $this->assertSame('2026-04-11', $today->format('Y-m-d'));
        $this->assertSame('00:00:00', $today->format('H:i:s'));
        $this->assertSame('Asia/Phnom_Penh', $today->getTimezone()->getName());
    }

    public function testRelativeAppliesExpressionToMockedNow(): void
    {
        DateService::setClock(new MockClock('2026-04-10 09:30:00', new DateTimeZone('UTC')));

        $oneHourLater = DateService::relative('+1 hour');
        $twoWeeksAgo = DateService::relative('-14 days');

        $this->assertSame('2026-04-10 10:30:00', $oneHourLater->format('Y-m-d H:i:s'));
        $this->assertSame('2026-03-27 09:30:00', $twoWeeksAgo->format('Y-m-d H:i:s'));
    }

    public function testMutableNowAndMutableRelativeAreClockAware(): void
    {
        DateService::setClock(new MockClock('2026-04-10 09:30:00', new DateTimeZone('UTC')));

        $now = DateService::mutableNow();
        $future = DateService::mutableRelative('+30 minutes');

        $this->assertInstanceOf(\DateTime::class, $now);
        $this->assertSame('2026-04-10 09:30:00', $now->format('Y-m-d H:i:s'));
        $this->assertSame('2026-04-10 10:00:00', $future->format('Y-m-d H:i:s'));
    }

    public function testParseStillUsesAbsoluteValueIndependentOfClock(): void
    {
        DateService::setClock(new MockClock('2026-04-10 09:30:00', new DateTimeZone('UTC')));

        // parse() takes an absolute string — it must NOT be relative to the mocked clock.
        $parsed = DateService::parse('2030-12-31');

        $this->assertSame('2030-12-31', $parsed->format('Y-m-d'));
    }

    public function testSetClockNullRestoresSystemClock(): void
    {
        DateService::setClock(new MockClock('1999-01-01 00:00:00', new DateTimeZone('UTC')));
        $this->assertSame('1999', DateService::now()->format('Y'));

        DateService::setClock(null);
        $year = (int) DateService::now()->format('Y');

        // System clock should return a current year — pinning to 1999 must have cleared.
        $this->assertGreaterThanOrEqual(2026, $year);
    }
}

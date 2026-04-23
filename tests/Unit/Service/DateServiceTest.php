<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Service\DateService;
use PHPUnit\Framework\TestCase;

class DateServiceTest extends TestCase
{
    public function testNowReturnsUtc(): void
    {
        $now = DateService::now();

        $this->assertSame('UTC', $now->getTimezone()->getName());
    }

    public function testTodayReturnsMidnightInGivenTimezone(): void
    {
        $tz = new \DateTimeZone('Asia/Phnom_Penh');
        $today = DateService::today($tz);

        $this->assertSame('00:00:00', $today->format('H:i:s'));
        $this->assertSame('Asia/Phnom_Penh', $today->getTimezone()->getName());
    }

    public function testRelativeReturnsUtc(): void
    {
        $future = DateService::relative('+1 hour');
        $now = DateService::now();

        $this->assertSame('UTC', $future->getTimezone()->getName());
        $this->assertGreaterThan($now, $future);
    }

    public function testParseReturnsUtc(): void
    {
        $date = DateService::parse('2026-04-01');

        $this->assertSame('UTC', $date->getTimezone()->getName());
        $this->assertSame('2026-04-01', $date->format('Y-m-d'));
    }

    public function testCreateFromFormatDefaultsToUtc(): void
    {
        $time = DateService::createFromFormat('H:i', '08:30');

        $this->assertSame('UTC', $time->getTimezone()->getName());
        $this->assertSame('08:30', $time->format('H:i'));
    }

    public function testCreateFromFormatWithCustomTimezone(): void
    {
        $tz = new \DateTimeZone('Asia/Phnom_Penh');
        $time = DateService::createFromFormat('H:i', '08:30', $tz);

        $this->assertSame('Asia/Phnom_Penh', $time->getTimezone()->getName());
    }

    public function testCreateFromFormatThrowsOnInvalidInput(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        DateService::createFromFormat('Y-m-d', 'not-a-date');
    }

    public function testToUtcConvertsTimezone(): void
    {
        $phnomPenh = new \DateTimeZone('Asia/Phnom_Penh'); // UTC+7
        $local = new \DateTimeImmutable('2026-04-01 15:00:00', $phnomPenh);

        $utc = DateService::toUtc($local);

        $this->assertSame('UTC', $utc->getTimezone()->getName());
        $this->assertSame('08:00', $utc->format('H:i'));
    }

    public function testMutableNowReturnsUtc(): void
    {
        $now = DateService::mutableNow();

        $this->assertInstanceOf(\DateTime::class, $now);
        $this->assertSame('UTC', $now->getTimezone()->getName());
    }

    public function testMutableRelativeReturnsUtc(): void
    {
        $future = DateService::mutableRelative('+1 day');

        $this->assertInstanceOf(\DateTime::class, $future);
        $this->assertSame('UTC', $future->getTimezone()->getName());
    }

    public function testMutableParseReturnsUtc(): void
    {
        $date = DateService::mutableParse('2026-04-01');

        $this->assertInstanceOf(\DateTime::class, $date);
        $this->assertSame('UTC', $date->getTimezone()->getName());
        $this->assertSame('2026-04-01', $date->format('Y-m-d'));
    }

    public function testUtcReturnsSameInstance(): void
    {
        $a = DateService::utc();
        $b = DateService::utc();

        $this->assertSame($a, $b);
    }
}

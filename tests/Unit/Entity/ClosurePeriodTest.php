<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\ClosurePeriod;
use App\Entity\Workspace;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

class ClosurePeriodTest extends TestCase
{
    public function testFieldsRoundTrip(): void
    {
        $workspace = new Workspace();
        $start = new DateTimeImmutable('2026-04-14');
        $end = new DateTimeImmutable('2026-04-16');

        $closure = (new ClosurePeriod())
            ->setWorkspace($workspace)
            ->setName('Khmer New Year')
            ->setNameCanonical('khmer-new-year')
            ->setStartDate($start)
            ->setEndDate($end);

        $this->assertSame($workspace, $closure->getWorkspace());
        $this->assertSame('Khmer New Year', $closure->getName());
        $this->assertSame('khmer-new-year', $closure->getNameCanonical());
        $this->assertSame($start, $closure->getStartDate());
        $this->assertSame($end, $closure->getEndDate());
    }

    public function testSingleDayClosureUsesSameStartAndEndDate(): void
    {
        $date = new DateTimeImmutable('2026-05-01');
        $closure = (new ClosurePeriod())
            ->setName('Labour Day')
            ->setStartDate($date)
            ->setEndDate($date);

        $this->assertSame($date, $closure->getStartDate());
        $this->assertSame($date, $closure->getEndDate());
    }
}

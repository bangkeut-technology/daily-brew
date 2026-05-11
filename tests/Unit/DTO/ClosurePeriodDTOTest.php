<?php

declare(strict_types=1);

namespace App\Tests\Unit\DTO;

use App\DTO\ClosurePeriodDTO;
use App\Entity\ClosurePeriod;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

class ClosurePeriodDTOTest extends TestCase
{
    public function testFromEntityFormatsDatesAsYearMonthDay(): void
    {
        $closure = (new ClosurePeriod())
            ->setName('Khmer New Year')
            ->setStartDate(new DateTimeImmutable('2026-04-14'))
            ->setEndDate(new DateTimeImmutable('2026-04-16'));

        $dto = ClosurePeriodDTO::fromEntity($closure);

        $this->assertSame('Khmer New Year', $dto->name);
        $this->assertSame('2026-04-14', $dto->startDate);
        $this->assertSame('2026-04-16', $dto->endDate);
        $this->assertNotEmpty($dto->publicId);
        $this->assertNotEmpty($dto->createdAt);
    }

    public function testToArrayContainsEveryField(): void
    {
        $closure = (new ClosurePeriod())
            ->setName('Labour Day')
            ->setStartDate(new DateTimeImmutable('2026-05-01'))
            ->setEndDate(new DateTimeImmutable('2026-05-01'));

        $arr = ClosurePeriodDTO::fromEntity($closure)->toArray();

        foreach (['publicId', 'name', 'startDate', 'endDate', 'createdAt'] as $key) {
            $this->assertArrayHasKey($key, $arr);
        }
        $this->assertSame('Labour Day', $arr['name']);
    }
}

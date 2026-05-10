<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\DayOfWeekEnum;
use PHPUnit\Framework\TestCase;

class DayOfWeekEnumTest extends TestCase
{
    public function testValuesMatchIsoWeekdayNumbering(): void
    {
        $this->assertSame(1, DayOfWeekEnum::Monday->value);
        $this->assertSame(2, DayOfWeekEnum::Tuesday->value);
        $this->assertSame(3, DayOfWeekEnum::Wednesday->value);
        $this->assertSame(4, DayOfWeekEnum::Thursday->value);
        $this->assertSame(5, DayOfWeekEnum::Friday->value);
        $this->assertSame(6, DayOfWeekEnum::Saturday->value);
        $this->assertSame(7, DayOfWeekEnum::Sunday->value);
    }

    public function testLabelMatchesEnglishWeekdayName(): void
    {
        $this->assertSame('Monday', DayOfWeekEnum::Monday->label());
        $this->assertSame('Tuesday', DayOfWeekEnum::Tuesday->label());
        $this->assertSame('Wednesday', DayOfWeekEnum::Wednesday->label());
        $this->assertSame('Thursday', DayOfWeekEnum::Thursday->label());
        $this->assertSame('Friday', DayOfWeekEnum::Friday->label());
        $this->assertSame('Saturday', DayOfWeekEnum::Saturday->label());
        $this->assertSame('Sunday', DayOfWeekEnum::Sunday->label());
    }

    public function testShortLabelIsThreeCharacterAbbreviation(): void
    {
        $this->assertSame('Mon', DayOfWeekEnum::Monday->shortLabel());
        $this->assertSame('Tue', DayOfWeekEnum::Tuesday->shortLabel());
        $this->assertSame('Wed', DayOfWeekEnum::Wednesday->shortLabel());
        $this->assertSame('Thu', DayOfWeekEnum::Thursday->shortLabel());
        $this->assertSame('Fri', DayOfWeekEnum::Friday->shortLabel());
        $this->assertSame('Sat', DayOfWeekEnum::Saturday->shortLabel());
        $this->assertSame('Sun', DayOfWeekEnum::Sunday->shortLabel());
    }

    public function testTryFromIsoWeekdayNumberRoundTrips(): void
    {
        $this->assertSame(DayOfWeekEnum::Monday, DayOfWeekEnum::tryFrom(1));
        $this->assertSame(DayOfWeekEnum::Sunday, DayOfWeekEnum::tryFrom(7));
        $this->assertNull(DayOfWeekEnum::tryFrom(0));
        $this->assertNull(DayOfWeekEnum::tryFrom(8));
    }
}

<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\PlanEnum;
use PHPUnit\Framework\TestCase;

class PlanEnumTest extends TestCase
{
    public function testValues(): void
    {
        $this->assertSame('free', PlanEnum::Free->value);
        $this->assertSame('espresso', PlanEnum::Espresso->value);
        $this->assertSame('double_espresso', PlanEnum::DoubleEspresso->value);
    }

    public function testLabels(): void
    {
        $this->assertSame('Free', PlanEnum::Free->label());
        $this->assertSame('Espresso', PlanEnum::Espresso->label());
        $this->assertSame('Double Espresso', PlanEnum::DoubleEspresso->label());
    }
}

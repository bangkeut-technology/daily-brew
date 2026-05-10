<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\LeaveRequestStatusEnum;
use PHPUnit\Framework\TestCase;

class LeaveRequestStatusEnumTest extends TestCase
{
    public function testValues(): void
    {
        $this->assertSame('pending', LeaveRequestStatusEnum::PENDING->value);
        $this->assertSame('approved', LeaveRequestStatusEnum::APPROVED->value);
        $this->assertSame('rejected', LeaveRequestStatusEnum::REJECTED->value);
    }

    public function testLabels(): void
    {
        $this->assertSame('Pending', LeaveRequestStatusEnum::PENDING->label());
        $this->assertSame('Approved', LeaveRequestStatusEnum::APPROVED->label());
        $this->assertSame('Rejected', LeaveRequestStatusEnum::REJECTED->label());
    }

    public function testEnumCoversThreeKnownStates(): void
    {
        $this->assertCount(3, LeaveRequestStatusEnum::cases());
    }
}

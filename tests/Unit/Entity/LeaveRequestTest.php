<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\LeaveRequest;
use App\Enum\LeaveRequestStatusEnum;
use App\Enum\LeaveTypeEnum;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

class LeaveRequestTest extends TestCase
{
    public function testIsFullDayWhenBothTimesAreNull(): void
    {
        $req = new LeaveRequest();

        $this->assertTrue($req->isFullDay());
    }

    public function testIsFullDayFalseWhenOnlyStartTimeSet(): void
    {
        $req = (new LeaveRequest())->setStartTime(new DateTimeImmutable('09:00:00'));

        $this->assertFalse($req->isFullDay());
    }

    public function testIsFullDayFalseWhenOnlyEndTimeSet(): void
    {
        $req = (new LeaveRequest())->setEndTime(new DateTimeImmutable('17:00:00'));

        $this->assertFalse($req->isFullDay());
    }

    public function testIsFullDayFalseWhenBothTimesSet(): void
    {
        $req = (new LeaveRequest())
            ->setStartTime(new DateTimeImmutable('09:00:00'))
            ->setEndTime(new DateTimeImmutable('12:00:00'));

        $this->assertFalse($req->isFullDay());
    }

    public function testClearingPartialTimesRestoresFullDay(): void
    {
        $req = (new LeaveRequest())
            ->setStartTime(new DateTimeImmutable('09:00:00'))
            ->setEndTime(new DateTimeImmutable('12:00:00'));

        $this->assertFalse($req->isFullDay());

        $req->setStartTime(null)->setEndTime(null);

        $this->assertTrue($req->isFullDay());
    }

    public function testStatusAndTypeRoundTrip(): void
    {
        $req = (new LeaveRequest())
            ->setStatus(LeaveRequestStatusEnum::APPROVED)
            ->setType(LeaveTypeEnum::PAID);

        $this->assertSame(LeaveRequestStatusEnum::APPROVED, $req->getStatus());
        $this->assertSame(LeaveTypeEnum::PAID, $req->getType());
    }
}

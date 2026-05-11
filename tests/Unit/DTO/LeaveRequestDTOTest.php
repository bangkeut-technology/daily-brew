<?php

declare(strict_types=1);

namespace App\Tests\Unit\DTO;

use App\DTO\LeaveRequestDTO;
use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Enum\LeaveRequestStatusEnum;
use App\Enum\LeaveTypeEnum;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

class LeaveRequestDTOTest extends TestCase
{
    public function testFromEntityFormatsFullDayRequest(): void
    {
        $emp = (new Employee())->setFirstName('Lyhour')->setLastName('Huy');
        $req = (new LeaveRequest())
            ->setEmployee($emp)
            ->setStartDate(new DateTimeImmutable('2026-04-10'))
            ->setEndDate(new DateTimeImmutable('2026-04-12'))
            ->setType(LeaveTypeEnum::PAID)
            ->setStatus(LeaveRequestStatusEnum::PENDING)
            ->setReason('medical');

        $dto = LeaveRequestDTO::fromEntity($req);

        $this->assertSame($emp->getPublicId(), $dto->employeePublicId);
        $this->assertSame('Lyhour Huy', $dto->employeeName);
        $this->assertSame('2026-04-10', $dto->startDate);
        $this->assertSame('2026-04-12', $dto->endDate);
        $this->assertNull($dto->startTime);
        $this->assertNull($dto->endTime);
        $this->assertTrue($dto->isFullDay);
        $this->assertSame('paid', $dto->type);
        $this->assertSame('pending', $dto->status);
        $this->assertSame('medical', $dto->reason);
        $this->assertNull($dto->reviewedAt);
    }

    public function testFromEntityFormatsPartialDayRequestWithReviewedAt(): void
    {
        $emp = (new Employee())->setFirstName('A')->setLastName('B');
        $req = (new LeaveRequest())
            ->setEmployee($emp)
            ->setStartDate(new DateTimeImmutable('2026-04-10'))
            ->setEndDate(new DateTimeImmutable('2026-04-10'))
            ->setStartTime(new DateTimeImmutable('09:00:00'))
            ->setEndTime(new DateTimeImmutable('12:00:00'))
            ->setType(LeaveTypeEnum::UNPAID)
            ->setStatus(LeaveRequestStatusEnum::APPROVED)
            ->setReviewedAt(new DateTimeImmutable('2026-04-09T10:00:00+07:00'));

        $dto = LeaveRequestDTO::fromEntity($req);

        $this->assertSame('09:00', $dto->startTime);
        $this->assertSame('12:00', $dto->endTime);
        $this->assertFalse($dto->isFullDay);
        $this->assertSame('unpaid', $dto->type);
        $this->assertSame('approved', $dto->status);
        $this->assertNotNull($dto->reviewedAt);
    }

    public function testToArrayContainsEveryField(): void
    {
        $emp = (new Employee())->setFirstName('A')->setLastName('B');
        $req = (new LeaveRequest())
            ->setEmployee($emp)
            ->setStartDate(new DateTimeImmutable('2026-04-10'))
            ->setEndDate(new DateTimeImmutable('2026-04-10'));

        $arr = LeaveRequestDTO::fromEntity($req)->toArray();

        foreach ([
            'publicId', 'employeePublicId', 'employeeName',
            'startDate', 'endDate', 'startTime', 'endTime',
            'isFullDay', 'type', 'reason', 'status',
            'reviewedAt', 'createdAt',
        ] as $key) {
            $this->assertArrayHasKey($key, $arr);
        }
    }
}

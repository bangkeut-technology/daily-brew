<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\LeaveRequest;
use App\Enum\LeaveRequestStatusEnum;
use App\Enum\LeaveTypeEnum;
use DateTimeImmutable;

final readonly class LeaveRequestDTO
{
    use HasEntityMapper;

    public function __construct(
        public int                    $id,
        public string                 $publicId,
        public LeaveTypeEnum          $type,
        public LeaveRequestStatusEnum $status,
        public DateTimeImmutable      $startDate,
        public DateTimeImmutable      $endDate,
        public ?string                $reason,
        public ?DateTimeImmutable     $reviewedAt,
        public ?string                $reviewNote,
        public ?EmployeeDTO           $employee,
        public ?DateTimeImmutable     $createdAt,
    ) {
    }

    public static function fromEntity(LeaveRequest $request): self
    {
        return new self(
            id: $request->id,
            publicId: $request->publicId,
            type: $request->getType(),
            status: $request->getStatus(),
            startDate: $request->getStartDate(),
            endDate: $request->getEndDate(),
            reason: $request->getReason(),
            reviewedAt: $request->getReviewedAt(),
            reviewNote: $request->getReviewNote(),
            employee: $request->getEmployee() ? EmployeeDTO::fromEntity($request->getEmployee()) : null,
            createdAt: $request->getCreatedAt(),
        );
    }
}

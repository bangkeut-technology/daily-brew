<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\LeaveRequest;

final readonly class LeaveRequestDTO
{
    public function __construct(
        public string  $publicId,
        public string  $employeePublicId,
        public string  $employeeName,
        public string  $startDate,
        public string  $endDate,
        public ?string $startTime,
        public ?string $endTime,
        public bool    $isFullDay,
        public string  $type,
        public ?string $reason,
        public string  $status,
        public ?string $reviewedAt,
        public string  $createdAt,
    ) {}

    public static function fromEntity(LeaveRequest $lr): self
    {
        return new self(
            publicId: (string) $lr->getPublicId(),
            employeePublicId: (string) $lr->getEmployee()->getPublicId(),
            employeeName: $lr->getEmployee()->getName(),
            startDate: $lr->getStartDate()->format('Y-m-d'),
            endDate: $lr->getEndDate()->format('Y-m-d'),
            startTime: $lr->getStartTime()?->format('H:i'),
            endTime: $lr->getEndTime()?->format('H:i'),
            isFullDay: $lr->isFullDay(),
            type: $lr->getType()->value,
            reason: $lr->getReason(),
            status: $lr->getStatus()->value,
            reviewedAt: $lr->getReviewedAt()?->format('c'),
            createdAt: $lr->getCreatedAt()->format('c'),
        );
    }

    public function toArray(): array
    {
        return [
            'publicId' => $this->publicId,
            'employeePublicId' => $this->employeePublicId,
            'employeeName' => $this->employeeName,
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'startTime' => $this->startTime,
            'endTime' => $this->endTime,
            'isFullDay' => $this->isFullDay,
            'type' => $this->type,
            'reason' => $this->reason,
            'status' => $this->status,
            'reviewedAt' => $this->reviewedAt,
            'createdAt' => $this->createdAt,
        ];
    }
}

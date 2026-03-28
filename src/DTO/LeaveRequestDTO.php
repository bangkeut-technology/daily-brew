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
            'reason' => $this->reason,
            'status' => $this->status,
            'reviewedAt' => $this->reviewedAt,
            'createdAt' => $this->createdAt,
        ];
    }
}

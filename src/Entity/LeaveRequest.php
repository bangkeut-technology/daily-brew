<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\LeaveRequestStatusEnum;
use App\Enum\LeaveTypeEnum;
use App\Repository\LeaveRequestRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class LeaveRequest
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_leave_requests')]
#[ORM\Entity(repositoryClass: LeaveRequestRepository::class)]
class LeaveRequest extends AbstractBaseEntity
{
    #[ORM\ManyToOne(targetEntity: Employee::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['leave_request:read'])]
    private ?Employee $employee = null;

    #[ORM\ManyToOne(targetEntity: Workspace::class, inversedBy: 'leaveRequests')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['leave_request:read'])]
    private ?User $requestedBy = null;

    #[ORM\Column(type: 'string', enumType: LeaveTypeEnum::class)]
    #[Groups(['leave_request:read'])]
    private LeaveTypeEnum $type = LeaveTypeEnum::PAID;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups(['leave_request:read'])]
    private ?DateTimeImmutable $startDate = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups(['leave_request:read'])]
    private ?DateTimeImmutable $endDate = null;

    #[ORM\Column(type: Types::TIME_IMMUTABLE, nullable: true)]
    #[Groups(['leave_request:read'])]
    private ?DateTimeImmutable $startTime = null;

    #[ORM\Column(type: Types::TIME_IMMUTABLE, nullable: true)]
    #[Groups(['leave_request:read'])]
    private ?DateTimeImmutable $endTime = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['leave_request:read'])]
    private ?string $reason = null;

    #[ORM\Column(type: 'string', enumType: LeaveRequestStatusEnum::class)]
    #[Groups(['leave_request:read'])]
    private LeaveRequestStatusEnum $status = LeaveRequestStatusEnum::PENDING;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['leave_request:read'])]
    private ?User $reviewedBy = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['leave_request:read'])]
    private ?DateTimeImmutable $reviewedAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['leave_request:read'])]
    private ?string $reviewNote = null;

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    public function getEmployee(): ?Employee
    {
        return $this->employee;
    }

    public function setEmployee(?Employee $employee): LeaveRequest
    {
        $this->employee = $employee;
        return $this;
    }

    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(?Workspace $workspace): LeaveRequest
    {
        $this->workspace = $workspace;
        return $this;
    }

    public function getRequestedBy(): ?User
    {
        return $this->requestedBy;
    }

    public function setRequestedBy(?User $requestedBy): LeaveRequest
    {
        $this->requestedBy = $requestedBy;
        return $this;
    }

    public function getType(): LeaveTypeEnum
    {
        return $this->type;
    }

    public function setType(LeaveTypeEnum $type): LeaveRequest
    {
        $this->type = $type;
        return $this;
    }

    public function getStartDate(): ?DateTimeImmutable
    {
        return $this->startDate;
    }

    public function setStartDate(?DateTimeImmutable $startDate): LeaveRequest
    {
        $this->startDate = $startDate;
        return $this;
    }

    public function getEndDate(): ?DateTimeImmutable
    {
        return $this->endDate;
    }

    public function setEndDate(?DateTimeImmutable $endDate): LeaveRequest
    {
        $this->endDate = $endDate;
        return $this;
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function setReason(?string $reason): LeaveRequest
    {
        $this->reason = $reason;
        return $this;
    }

    public function getStatus(): LeaveRequestStatusEnum
    {
        return $this->status;
    }

    public function setStatus(LeaveRequestStatusEnum $status): LeaveRequest
    {
        $this->status = $status;
        return $this;
    }

    public function getReviewedBy(): ?User
    {
        return $this->reviewedBy;
    }

    public function setReviewedBy(?User $reviewedBy): LeaveRequest
    {
        $this->reviewedBy = $reviewedBy;
        return $this;
    }

    public function getReviewedAt(): ?DateTimeImmutable
    {
        return $this->reviewedAt;
    }

    public function setReviewedAt(?DateTimeImmutable $reviewedAt): LeaveRequest
    {
        $this->reviewedAt = $reviewedAt;
        return $this;
    }

    public function getReviewNote(): ?string
    {
        return $this->reviewNote;
    }

    public function setReviewNote(?string $reviewNote): LeaveRequest
    {
        $this->reviewNote = $reviewNote;
        return $this;
    }

    public function getStartTime(): ?DateTimeImmutable
    {
        return $this->startTime;
    }

    public function setStartTime(?DateTimeImmutable $startTime): LeaveRequest
    {
        $this->startTime = $startTime;
        return $this;
    }

    public function getEndTime(): ?DateTimeImmutable
    {
        return $this->endTime;
    }

    public function setEndTime(?DateTimeImmutable $endTime): LeaveRequest
    {
        $this->endTime = $endTime;
        return $this;
    }

    public function isFullDay(): bool
    {
        return $this->startTime === null && $this->endTime === null;
    }

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?DateTimeImmutable $deletedAt): LeaveRequest
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }
}

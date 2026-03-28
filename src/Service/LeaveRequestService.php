<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\LeaveRequestStatusEnum;
use Doctrine\ORM\EntityManagerInterface;

class LeaveRequestService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function create(
        Employee $employee,
        Workspace $workspace,
        User $requestedBy,
        \DateTimeInterface $startDate,
        \DateTimeInterface $endDate,
        ?string $reason = null,
    ): LeaveRequest {
        $leaveRequest = new LeaveRequest();
        $leaveRequest->setEmployee($employee);
        $leaveRequest->setWorkspace($workspace);
        $leaveRequest->setRequestedBy($requestedBy);
        $leaveRequest->setStartDate(\DateTimeImmutable::createFromInterface($startDate));
        $leaveRequest->setEndDate(\DateTimeImmutable::createFromInterface($endDate));
        $leaveRequest->setReason($reason);

        $this->em->persist($leaveRequest);
        $this->em->flush();

        return $leaveRequest;
    }

    public function approve(LeaveRequest $leaveRequest, ?User $reviewedBy = null): LeaveRequest
    {
        $leaveRequest->setStatus(LeaveRequestStatusEnum::APPROVED);
        $leaveRequest->setReviewedAt(new \DateTimeImmutable());
        $leaveRequest->setReviewedBy($reviewedBy);
        $this->em->flush();

        return $leaveRequest;
    }

    public function reject(LeaveRequest $leaveRequest, ?User $reviewedBy = null, ?string $reviewNote = null): LeaveRequest
    {
        $leaveRequest->setStatus(LeaveRequestStatusEnum::REJECTED);
        $leaveRequest->setReviewedAt(new \DateTimeImmutable());
        $leaveRequest->setReviewedBy($reviewedBy);
        if ($reviewNote !== null) {
            $leaveRequest->setReviewNote($reviewNote);
        }
        $this->em->flush();

        return $leaveRequest;
    }
}

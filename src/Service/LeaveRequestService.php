<?php

namespace App\Service;

use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Enum\LeaveRequestStatus;
use Doctrine\ORM\EntityManagerInterface;

class LeaveRequestService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function create(Employee $employee, \DateTimeInterface $date, ?string $reason = null): LeaveRequest
    {
        $leaveRequest = new LeaveRequest();
        $leaveRequest->setEmployee($employee);
        $leaveRequest->setDate($date);
        $leaveRequest->setReason($reason);

        $this->em->persist($leaveRequest);
        $this->em->flush();

        return $leaveRequest;
    }

    public function approve(LeaveRequest $leaveRequest): LeaveRequest
    {
        $leaveRequest->setStatus(LeaveRequestStatus::Approved);
        $leaveRequest->setReviewedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $leaveRequest;
    }

    public function reject(LeaveRequest $leaveRequest): LeaveRequest
    {
        $leaveRequest->setStatus(LeaveRequestStatus::Rejected);
        $leaveRequest->setReviewedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $leaveRequest;
    }
}

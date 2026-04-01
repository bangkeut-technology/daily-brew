<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\LeaveRequestStatusEnum;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class LeaveRequestService
{
    public function __construct(
        private EntityManagerInterface $em,
        private ClosurePeriodRepository $closurePeriodRepository,
        private LeaveRequestRepository $leaveRequestRepository,
        private NotificationService $notificationService,
    ) {}

    public function create(
        Employee $employee,
        Workspace $workspace,
        User $requestedBy,
        \DateTimeInterface $startDate,
        \DateTimeInterface $endDate,
        ?string $reason = null,
        ?\DateTimeInterface $startTime = null,
        ?\DateTimeInterface $endTime = null,
    ): LeaveRequest {
        if ($startDate > $endDate) {
            throw new BadRequestHttpException('Start date must be before or equal to end date');
        }

        $closure = $this->closurePeriodRepository->findOverlappingClosure($workspace, $startDate, $endDate);
        if ($closure !== null) {
            throw new BadRequestHttpException('Leave dates overlap with closure: ' . $closure->getName());
        }

        $existing = $this->leaveRequestRepository->findOverlappingForEmployee($employee, $startDate, $endDate);
        if ($existing !== null) {
            throw new BadRequestHttpException('You already have a pending or approved leave request for these dates');
        }

        $leaveRequest = new LeaveRequest();
        $leaveRequest->setEmployee($employee);
        $leaveRequest->setWorkspace($workspace);
        $leaveRequest->setRequestedBy($requestedBy);
        $leaveRequest->setStartDate(\DateTimeImmutable::createFromInterface($startDate));
        $leaveRequest->setEndDate(\DateTimeImmutable::createFromInterface($endDate));
        $leaveRequest->setReason($reason);

        if ($startTime !== null) {
            $leaveRequest->setStartTime(\DateTimeImmutable::createFromInterface($startTime));
        }
        if ($endTime !== null) {
            $leaveRequest->setEndTime(\DateTimeImmutable::createFromInterface($endTime));
        }

        $this->em->persist($leaveRequest);
        $this->em->flush();

        $this->notificationService->notifyLeaveRequestSubmitted($leaveRequest);

        return $leaveRequest;
    }

    public function approve(LeaveRequest $leaveRequest, ?User $reviewedBy = null): LeaveRequest
    {
        $leaveRequest->setStatus(LeaveRequestStatusEnum::APPROVED);
        $leaveRequest->setReviewedAt(new \DateTimeImmutable('now', new \DateTimeZone('UTC')));
        $leaveRequest->setReviewedBy($reviewedBy);
        $this->em->flush();

        $this->notificationService->notifyLeaveRequestApproved($leaveRequest);

        return $leaveRequest;
    }

    public function reject(LeaveRequest $leaveRequest, ?User $reviewedBy = null, ?string $reviewNote = null): LeaveRequest
    {
        $leaveRequest->setStatus(LeaveRequestStatusEnum::REJECTED);
        $leaveRequest->setReviewedAt(new \DateTimeImmutable('now', new \DateTimeZone('UTC')));
        $leaveRequest->setReviewedBy($reviewedBy);
        if ($reviewNote !== null) {
            $leaveRequest->setReviewNote($reviewNote);
        }
        $this->em->flush();

        $this->notificationService->notifyLeaveRequestRejected($leaveRequest);

        return $leaveRequest;
    }
}

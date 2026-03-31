<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\ClosurePeriod;
use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\User;
use App\Entity\Workspace;
use App\Repository\DeviceTokenRepository;
use App\Repository\EmployeeRepository;

class NotificationService
{
    public function __construct(
        private ExpoPushService $expoPushService,
        private EmailService $emailService,
        private DeviceTokenRepository $deviceTokenRepository,
        private EmployeeRepository $employeeRepository,
    ) {}

    public function notifyLeaveRequestSubmitted(LeaveRequest $leaveRequest): void
    {
        $employee = $leaveRequest->getEmployee();
        $workspace = $leaveRequest->getWorkspace();
        $owner = $workspace->getOwner();

        if ($owner === null) {
            return;
        }

        $dates = $this->formatDateRange($leaveRequest->getStartDate(), $leaveRequest->getEndDate());
        $pushBody = sprintf('%s requested leave for %s', $employee->getName(), $dates);

        // Push
        $this->expoPushService->send(
            $this->getTokensForUser($owner),
            'New leave request',
            $pushBody,
            ['type' => 'leave_request_submitted', 'workspacePublicId' => $workspace->getPublicId()],
        );

        // Email
        $this->emailService->send(
            $owner->getEmail(),
            'New leave request — ' . $employee->getName(),
            'emails/leave_request_submitted.html.twig',
            [
                'employeeName' => $employee->getName(),
                'workspaceName' => $workspace->getName(),
                'dates' => $dates,
                'reason' => $leaveRequest->getReason(),
            ],
        );
    }

    public function notifyLeaveRequestApproved(LeaveRequest $leaveRequest): void
    {
        $this->notifyLeaveRequestDecision($leaveRequest, 'approved');
    }

    public function notifyLeaveRequestRejected(LeaveRequest $leaveRequest): void
    {
        $this->notifyLeaveRequestDecision($leaveRequest, 'rejected');
    }

    public function notifyShiftAssigned(Employee $employee): void
    {
        $linkedUser = $employee->getLinkedUser();
        if ($linkedUser === null) {
            return;
        }

        $shift = $employee->getShift();
        if ($shift === null) {
            return;
        }

        $shiftStart = $shift->getStartTime()?->format('H:i') ?? '';
        $shiftEnd = $shift->getEndTime()?->format('H:i') ?? '';

        // Push
        $this->expoPushService->send(
            $this->getTokensForUser($linkedUser),
            'Shift assigned',
            sprintf('You have been assigned to the %s shift (%s – %s)', $shift->getName(), $shiftStart, $shiftEnd),
            ['type' => 'shift_assigned', 'workspacePublicId' => $employee->getWorkspace()->getPublicId()],
        );

        // Email
        $this->emailService->send(
            $linkedUser->getEmail(),
            'Shift assigned — ' . $shift->getName(),
            'emails/shift_assigned.html.twig',
            [
                'workspaceName' => $employee->getWorkspace()->getName(),
                'shiftName' => $shift->getName(),
                'shiftStart' => $shiftStart,
                'shiftEnd' => $shiftEnd,
            ],
        );
    }

    public function notifyClosureCreated(ClosurePeriod $closure): void
    {
        $workspace = $closure->getWorkspace();
        $employees = $this->employeeRepository->findByWorkspace($workspace);
        $dates = $this->formatDateRange($closure->getStartDate(), $closure->getEndDate());

        $tokens = [];
        $emails = [];
        foreach ($employees as $employee) {
            $linkedUser = $employee->getLinkedUser();
            if ($linkedUser !== null) {
                $tokens = array_merge($tokens, $this->getTokensForUser($linkedUser));
                $emails[] = $linkedUser->getEmail();
            }
        }

        // Push
        $this->expoPushService->send(
            $tokens,
            'Closure announced',
            sprintf('%s: %s', $closure->getName(), $dates),
            ['type' => 'closure_created', 'workspacePublicId' => $workspace->getPublicId()],
        );

        // Email
        $this->emailService->sendToMany(
            array_unique($emails),
            'Closure announced — ' . $closure->getName(),
            'emails/closure_created.html.twig',
            [
                'workspaceName' => $workspace->getName(),
                'closureName' => $closure->getName(),
                'dates' => $dates,
            ],
        );
    }

    /**
     * Send daily attendance summary to the workspace owner (Espresso).
     */
    public function notifyDailySummary(
        Workspace $workspace,
        int $totalEmployees,
        int $presentCount,
        int $lateCount,
        int $onLeaveCount,
    ): void {
        $owner = $workspace->getOwner();
        if ($owner === null) {
            return;
        }

        $absentCount = max(0, $totalEmployees - $presentCount - $onLeaveCount);

        $body = sprintf(
            '%d present, %d late, %d on leave, %d absent',
            $presentCount,
            $lateCount,
            $onLeaveCount,
            $absentCount,
        );

        $subject = sprintf('%s — Daily summary', $workspace->getName());

        // Push
        $this->expoPushService->send(
            $this->getTokensForUser($owner),
            $subject,
            $body,
            ['type' => 'daily_summary', 'workspacePublicId' => $workspace->getPublicId()],
        );

        // Email
        $this->emailService->send(
            $owner->getEmail(),
            $subject,
            'emails/daily_summary.html.twig',
            [
                'workspaceName' => $workspace->getName(),
                'totalEmployees' => $totalEmployees,
                'presentCount' => $presentCount,
                'lateCount' => $lateCount,
                'onLeaveCount' => $onLeaveCount,
                'absentCount' => $absentCount,
            ],
        );
    }

    private function notifyLeaveRequestDecision(LeaveRequest $leaveRequest, string $decision): void
    {
        $employee = $leaveRequest->getEmployee();
        $linkedUser = $employee->getLinkedUser();

        if ($linkedUser === null) {
            return;
        }

        $dates = $this->formatDateRange($leaveRequest->getStartDate(), $leaveRequest->getEndDate());

        // Push
        $this->expoPushService->send(
            $this->getTokensForUser($linkedUser),
            sprintf('Leave request %s', $decision),
            sprintf('Your leave request for %s has been %s', $dates, $decision),
            ['type' => 'leave_request_' . $decision, 'workspacePublicId' => $leaveRequest->getWorkspace()->getPublicId()],
        );

        // Email
        $this->emailService->send(
            $linkedUser->getEmail(),
            sprintf('Leave request %s', $decision),
            'emails/leave_request_decision.html.twig',
            [
                'decision' => $decision,
                'dates' => $dates,
            ],
        );
    }

    private function formatDateRange(\DateTimeInterface $start, \DateTimeInterface $end): string
    {
        $dates = $start->format('M j');
        if ($start != $end) {
            $dates .= ' – ' . $end->format('M j');
        }

        return $dates;
    }

    /**
     * @return string[]
     */
    private function getTokensForUser(User $user): array
    {
        $deviceTokens = $this->deviceTokenRepository->findBy(['user' => $user]);

        return array_map(
            fn($dt) => $dt->getToken(),
            $deviceTokens,
        );
    }
}

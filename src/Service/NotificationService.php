<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Attendance;
use App\Entity\ClosurePeriod;
use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\EmployeeStatusEnum;
use App\Enum\ManagerPermissionEnum;
use App\Repository\DeviceTokenRepository;
use App\Repository\EmployeeRepository;

class NotificationService
{
    public function __construct(
        private ExpoPushService       $expoPushService,
        private EmailService          $emailService,
        private TelegramService       $telegramService,
        private DeviceTokenRepository $deviceTokenRepository,
        private EmployeeRepository    $employeeRepository,
    )
    {
    }

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
                'employeeName'  => $employee->getName(),
                'workspaceName' => $workspace->getName(),
                'dates'         => $dates,
                'reason'        => $leaveRequest->getReason(),
            ],
        );

        // Telegram
        $reason = $leaveRequest->getReason();
        $tgText = sprintf(
            "📋 <b>New leave request</b>\n%s requested leave for %s%s",
            $employee->getName(),
            $dates,
            $reason ? "\nReason: " . $reason : '',
        );
        $this->sendTelegram($workspace, $tgText);
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
                'shiftName'     => $shift->getName(),
                'shiftStart'    => $shiftStart,
                'shiftEnd'      => $shiftEnd,
            ],
        );

        // Telegram
        $tgText = sprintf(
            "🔔 <b>Shift assigned</b>\n%s → %s (%s – %s)",
            $employee->getName(),
            $shift->getName(),
            $shiftStart,
            $shiftEnd,
        );
        $this->sendTelegram($employee->getWorkspace(), $tgText);
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
                'closureName'   => $closure->getName(),
                'dates'         => $dates,
            ],
        );

        // Telegram
        $tgText = sprintf(
            "🚫 <b>Closure announced</b>\n%s: %s",
            $closure->getName(),
            $dates,
        );
        $this->sendTelegram($workspace, $tgText);
    }

    /**
     * Send daily attendance summary to the workspace owner (Espresso).
     */
    public function notifyDailySummary(
        Workspace $workspace,
        int       $totalEmployees,
        int       $presentCount,
        int       $lateCount,
        int       $onLeaveCount,
    ): void
    {
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
                'workspaceName'  => $workspace->getName(),
                'totalEmployees' => $totalEmployees,
                'presentCount'   => $presentCount,
                'lateCount'      => $lateCount,
                'onLeaveCount'   => $onLeaveCount,
                'absentCount'    => $absentCount,
            ],
        );

        // Telegram
        $tgText = sprintf(
            "📊 <b>%s</b>\n✅ %d present · ⏰ %d late · 🏖 %d on leave · ❌ %d absent",
            $subject,
            $presentCount,
            $lateCount,
            $onLeaveCount,
            $absentCount,
        );
        $this->sendTelegram($workspace, $tgText);
    }

    /**
     * Alert the owner + every manager with `manage_attendance` that a tracked
     * employee on a shift has no check-in row an hour after their shift started.
     */
    public function notifyMissingCheckin(Employee $employee, Shift $shift, \DateTimeImmutable $expectedAt): void
    {
        $workspace = $employee->getWorkspace();
        if ($workspace === null) {
            return;
        }

        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $shiftStart = $shift->getStartTime()?->format('H:i') ?? '';
        $expectedLocal = $expectedAt->setTimezone($tz)->format('H:i');

        $title = 'Missing check-in';
        $body = sprintf(
            '%s has not checked in for the %s shift (started %s)',
            $employee->getName(),
            $shift->getName(),
            $shiftStart !== '' ? $shiftStart : 'today',
        );

        $payload = [
            'type' => 'missing_checkin',
            'workspacePublicId' => $workspace->getPublicId(),
            'employeePublicId' => $employee->getPublicId(),
            'shiftName' => $shift->getName(),
        ];

        $recipients = $this->attendanceManagerRecipients($workspace);
        $this->expoPushService->send($recipients['tokens'], $title, $body, $payload);
        $this->emailService->sendToMany(
            $recipients['emails'],
            sprintf('Missing check-in — %s', $employee->getName()),
            'emails/missing_checkin.html.twig',
            [
                'workspaceName' => $workspace->getName(),
                'employeeName' => $employee->getName(),
                'shiftName' => $shift->getName(),
                'shiftStart' => $shiftStart,
                'expectedTime' => $expectedLocal,
            ],
        );

        $tgText = sprintf(
            "⏰ <b>Missing check-in</b>\n%s has not checked in for the %s shift (started %s)",
            $employee->getName(),
            $shift->getName(),
            $shiftStart !== '' ? $shiftStart : 'today',
        );
        $this->sendTelegram($workspace, $tgText);
    }

    /**
     * Alert the owner + every manager with `manage_attendance` that an attendance
     * row still has no check-out an hour after the shift ended (likely forgot to
     * scan out).
     */
    public function notifyMissingCheckout(Attendance $attendance, Shift $shift, \DateTimeImmutable $expectedAt): void
    {
        $employee = $attendance->getEmployee();
        $workspace = $attendance->getWorkspace();
        if ($employee === null || $workspace === null) {
            return;
        }

        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $shiftEnd = $shift->getEndTime()?->format('H:i') ?? '';
        $expectedLocal = $expectedAt->setTimezone($tz)->format('H:i');
        $checkInLocal = $attendance->getCheckInAt()?->setTimezone($tz)->format('H:i') ?? '—';

        $title = 'Missing check-out';
        $body = sprintf(
            '%s has not checked out from the %s shift (ended %s)',
            $employee->getName(),
            $shift->getName(),
            $shiftEnd !== '' ? $shiftEnd : 'today',
        );

        $payload = [
            'type' => 'missing_checkout',
            'workspacePublicId' => $workspace->getPublicId(),
            'employeePublicId' => $employee->getPublicId(),
            'shiftName' => $shift->getName(),
        ];

        $recipients = $this->attendanceManagerRecipients($workspace);
        $this->expoPushService->send($recipients['tokens'], $title, $body, $payload);
        $this->emailService->sendToMany(
            $recipients['emails'],
            sprintf('Missing check-out — %s', $employee->getName()),
            'emails/missing_checkout.html.twig',
            [
                'workspaceName' => $workspace->getName(),
                'employeeName' => $employee->getName(),
                'shiftName' => $shift->getName(),
                'shiftEnd' => $shiftEnd,
                'checkInTime' => $checkInLocal,
                'expectedTime' => $expectedLocal,
            ],
        );

        $tgText = sprintf(
            "⏰ <b>Missing check-out</b>\n%s has not checked out from the %s shift (ended %s)",
            $employee->getName(),
            $shift->getName(),
            $shiftEnd !== '' ? $shiftEnd : 'today',
        );
        $this->sendTelegram($workspace, $tgText);
    }

    /**
     * Collect push tokens + email addresses for everyone who should hear about a
     * workspace-wide attendance anomaly: the owner plus every active manager
     * (with a linked user) carrying the `manage_attendance` capability.
     *
     * @return array{tokens: list<string>, emails: list<string>}
     */
    private function attendanceManagerRecipients(Workspace $workspace): array
    {
        $tokens = [];
        $emails = [];
        $seenUsers = [];

        $owner = $workspace->getOwner();
        if ($owner !== null) {
            $tokens = array_merge($tokens, $this->getTokensForUser($owner));
            $emails[] = $owner->getEmail();
            $seenUsers[spl_object_id($owner)] = true;
        }

        foreach ($workspace->getEmployees() as $employee) {
            if ($employee->getDeletedAt() !== null) {
                continue;
            }
            if ($employee->getStatus() !== EmployeeStatusEnum::ACTIVE) {
                continue;
            }
            if (!$employee->hasManagerPermission(ManagerPermissionEnum::MANAGE_ATTENDANCE)) {
                continue;
            }

            $linkedUser = $employee->getLinkedUser();
            if ($linkedUser === null) {
                continue;
            }

            $key = spl_object_id($linkedUser);
            if (isset($seenUsers[$key])) {
                continue;
            }
            $seenUsers[$key] = true;

            $tokens = array_merge($tokens, $this->getTokensForUser($linkedUser));
            $emails[] = $linkedUser->getEmail();
        }

        return [
            'tokens' => array_values(array_unique($tokens)),
            'emails' => array_values(array_unique(array_filter($emails))),
        ];
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
                'dates'    => $dates,
            ],
        );

        // Telegram
        $icon = $decision === 'approved' ? '✅' : '❌';
        $tgText = sprintf(
            "%s <b>Leave request %s</b>\n%s — %s",
            $icon,
            $decision,
            $employee->getName(),
            $dates,
        );
        $this->sendTelegram($leaveRequest->getWorkspace(), $tgText);
    }

    /**
     * Alert the owner/workspace that an attendance punch came from a device
     * the employee hasn't used before. $action is 'in' or 'out'.
     */
    public function notifyDeviceAnomaly(Attendance $attendance, string $action): void
    {
        $employee = $attendance->getEmployee();
        $workspace = $attendance->getWorkspace();
        if ($employee === null || $workspace === null) {
            return;
        }

        $isOut = $action === 'out';
        $verb = $isOut ? 'checked out' : 'checked in';
        $deviceName = $isOut ? $attendance->getCheckOutDeviceName() : $attendance->getCheckInDeviceName();
        $deviceId = $isOut ? $attendance->getCheckOutDeviceId() : $attendance->getCheckInDeviceId();
        $deviceLabel = $deviceName
            ?: ($deviceId !== null && $deviceId !== '' ? 'ID ' . substr($deviceId, 0, 8) : 'an unknown device');

        $when = $isOut ? $attendance->getCheckOutAt() : $attendance->getCheckInAt();
        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $timeStr = $when !== null ? $when->setTimezone($tz)->format('M j, H:i') : 'unknown time';

        $owner = $workspace->getOwner();
        if ($owner !== null) {
            $this->expoPushService->send(
                $this->getTokensForUser($owner),
                'New device used',
                sprintf('%s %s from a new device (%s)', $employee->getName(), $verb, $deviceLabel),
                ['type' => 'attendance_anomaly', 'workspacePublicId' => $workspace->getPublicId()],
            );
        }

        $tgText = sprintf(
            "⚠️ <b>New device used</b>\n%s %s from a new device.\nDevice: %s\nTime: %s",
            $employee->getName(),
            $verb,
            $deviceLabel,
            $timeStr,
        );
        $this->sendTelegram($workspace, $tgText);
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
     * Send a Telegram message to the workspace chat if enabled.
     */
    private function sendTelegram(Workspace $workspace, string $text): void
    {
        $setting = $workspace->getSetting();
        if ($setting === null || !$setting->isTelegramNotificationsEnabled()) {
            return;
        }

        $chatId = $setting->getTelegramChatId();
        if ($chatId === null || $chatId === '') {
            return;
        }

        $this->telegramService->send($chatId, $text);
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

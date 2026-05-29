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

        // Telegram — workspace group chat + owner's personal Telegram (if linked)
        $reason = $leaveRequest->getReason();
        $tgText = sprintf(
            "📋 <b>New leave request</b>\n%s requested leave for %s%s",
            $employee->getName(),
            $dates,
            $reason ? "\nReason: " . $reason : '',
        );
        $this->sendTelegram($workspace, $tgText);
        $this->sendTelegramToUser($owner, $tgText);
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

        // Telegram — workspace group chat + the assigned employee's personal Telegram
        $tgText = sprintf(
            "🔔 <b>Shift assigned</b>\n%s → %s (%s – %s)",
            $employee->getName(),
            $shift->getName(),
            $shiftStart,
            $shiftEnd,
        );
        $this->sendTelegram($employee->getWorkspace(), $tgText);
        $this->sendTelegramToUser($linkedUser, $tgText);
    }

    public function notifyClosureCreated(ClosurePeriod $closure): void
    {
        $workspace = $closure->getWorkspace();
        $employees = $this->employeeRepository->findByWorkspace($workspace);
        $dates = $this->formatDateRange($closure->getStartDate(), $closure->getEndDate());

        $tokens = [];
        $emails = [];
        $linkedUsers = [];
        foreach ($employees as $employee) {
            $linkedUser = $employee->getLinkedUser();
            if ($linkedUser !== null) {
                $tokens = array_merge($tokens, $this->getTokensForUser($linkedUser));
                $emails[] = $linkedUser->getEmail();
                $linkedUsers[] = $linkedUser;
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

        // Telegram — workspace group chat + every linked employee's personal Telegram
        $tgText = sprintf(
            "🚫 <b>Closure announced</b>\n%s: %s",
            $closure->getName(),
            $dates,
        );
        $this->sendTelegram($workspace, $tgText);
        $this->sendTelegramToUsers($linkedUsers, $tgText);
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

        // Telegram — workspace group chat + owner + every manage-attendance manager personally
        $tgText = sprintf(
            "📊 <b>%s</b>\n✅ %d present · ⏰ %d late · 🏖 %d on leave · ❌ %d absent",
            $subject,
            $presentCount,
            $lateCount,
            $onLeaveCount,
            $absentCount,
        );
        $this->sendTelegram($workspace, $tgText);
        $recipients = $this->attendanceManagerRecipients($workspace);
        $this->sendTelegramToUsers($recipients['users'], $tgText);
    }

    /**
     * Push + email + Telegram digest of a single shift edge — start or end —
     * for everyone who manages attendance on this workspace.
     *
     * Expected summary shape (mirrors `ShiftSummaryService::scan()`):
     *   - type: 'start' | 'end'
     *   - shift: Shift
     *   - dueAt: \DateTimeImmutable (UTC)
     *   - total: int
     *   - For 'start': onTime/late/missed lists of Employee
     *   - For 'end':   completed/leftEarly/missed lists of Employee
     *
     * @param array<string, mixed> $summary
     */
    public function notifyShiftSummary(Workspace $workspace, array $summary): void
    {
        $type = $summary['type'] ?? null;
        $shift = $summary['shift'] ?? null;
        if (!$shift instanceof Shift || ($type !== 'start' && $type !== 'end')) {
            return;
        }

        $isStart = $type === 'start';
        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

        $shiftStart = $shift->getStartTime()?->format('H:i') ?? '';
        $shiftEnd = $shift->getEndTime()?->format('H:i') ?? '';
        $edgeLocal = $isStart ? $shiftStart : $shiftEnd;

        $total = (int) ($summary['total'] ?? 0);
        $missed = $this->namesOf($summary['missed'] ?? []);
        $late = $isStart ? $this->namesOf($summary['late'] ?? []) : [];
        $leftEarly = $isStart ? [] : $this->namesOf($summary['leftEarly'] ?? []);
        $onTimeCount = $isStart ? count($summary['onTime'] ?? []) : 0;
        $completedCount = $isStart ? 0 : count($summary['completed'] ?? []);

        if ($isStart) {
            $title = sprintf('%s shift started', $shift->getName());
            $body = sprintf(
                '%d on time, %d late, %d missed (of %d)',
                $onTimeCount,
                count($late),
                count($missed),
                $total,
            );
            $payloadType = 'shift_start_summary';
            $subject = sprintf('%s — %s shift summary', $workspace->getName(), $shift->getName());
            $template = 'emails/shift_start_summary.html.twig';
        } else {
            $title = sprintf('%s shift ended', $shift->getName());
            $body = sprintf(
                '%d completed, %d left early, %d missed (of %d)',
                $completedCount,
                count($leftEarly),
                count($missed),
                $total,
            );
            $payloadType = 'shift_end_summary';
            $subject = sprintf('%s — %s shift wrap-up', $workspace->getName(), $shift->getName());
            $template = 'emails/shift_end_summary.html.twig';
        }

        $payload = [
            'type' => $payloadType,
            'workspacePublicId' => $workspace->getPublicId(),
            'shiftPublicId' => $shift->getPublicId(),
            'shiftName' => $shift->getName(),
            'total' => $total,
            'missedCount' => count($missed),
        ];
        if ($isStart) {
            $payload['onTimeCount'] = $onTimeCount;
            $payload['lateCount'] = count($late);
        } else {
            $payload['completedCount'] = $completedCount;
            $payload['leftEarlyCount'] = count($leftEarly);
        }

        $recipients = $this->attendanceManagerRecipients($workspace);

        $this->expoPushService->send($recipients['tokens'], $title, $body, $payload);

        $this->emailService->sendToMany(
            $recipients['emails'],
            $subject,
            $template,
            $isStart
                ? [
                    'workspaceName' => $workspace->getName(),
                    'shiftName' => $shift->getName(),
                    'shiftStart' => $shiftStart,
                    'shiftEnd' => $shiftEnd,
                    'edgeTime' => $edgeLocal,
                    'total' => $total,
                    'onTimeCount' => $onTimeCount,
                    'lateCount' => count($late),
                    'missedCount' => count($missed),
                    'lateNames' => $this->truncateNames($late, 5),
                    'lateOverflow' => max(0, count($late) - 5),
                    'missedNames' => $this->truncateNames($missed, 5),
                    'missedOverflow' => max(0, count($missed) - 5),
                ]
                : [
                    'workspaceName' => $workspace->getName(),
                    'shiftName' => $shift->getName(),
                    'shiftStart' => $shiftStart,
                    'shiftEnd' => $shiftEnd,
                    'edgeTime' => $edgeLocal,
                    'total' => $total,
                    'completedCount' => $completedCount,
                    'leftEarlyCount' => count($leftEarly),
                    'missedCount' => count($missed),
                    'leftEarlyNames' => $this->truncateNames($leftEarly, 5),
                    'leftEarlyOverflow' => max(0, count($leftEarly) - 5),
                    'missedNames' => $this->truncateNames($missed, 5),
                    'missedOverflow' => max(0, count($missed) - 5),
                ],
        );

        $tgEmoji = $isStart ? '☕️' : '🌙';
        $tgText = sprintf(
            "%s <b>%s</b>\n%s",
            $tgEmoji,
            $title,
            $body,
        );
        $this->sendTelegram($workspace, $tgText);
        // Personal Telegram for owner + every manage-attendance manager (reuses
        // the same recipient set as the push/email fan-out above).
        $this->sendTelegramToUsers($recipients['users'], $tgText);
    }

    /**
     * @param iterable<Employee> $employees
     * @return list<string>
     */
    private function namesOf(iterable $employees): array
    {
        $names = [];
        foreach ($employees as $employee) {
            if ($employee instanceof Employee) {
                $names[] = $employee->getName();
            }
        }
        return $names;
    }

    /**
     * @param list<string> $names
     * @return list<string>
     */
    private function truncateNames(array $names, int $max): array
    {
        return array_slice($names, 0, $max);
    }

    /**
     * Collect push tokens + email addresses + raw User entities for everyone
     * who should hear about a workspace-wide attendance digest: the owner plus
     * every active manager (with a linked user) carrying the
     * `manage_attendance` capability.
     *
     * Users are surfaced separately so callers can fan out personal Telegram
     * notifications (User.telegramChatId) to the same recipient set.
     *
     * @return array{tokens: list<string>, emails: list<string>, users: list<User>}
     */
    private function attendanceManagerRecipients(Workspace $workspace): array
    {
        $tokens = [];
        $emails = [];
        $users = [];
        $seenUsers = [];

        $owner = $workspace->getOwner();
        if ($owner !== null) {
            $tokens = array_merge($tokens, $this->getTokensForUser($owner));
            $emails[] = $owner->getEmail();
            $users[] = $owner;
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
            $users[] = $linkedUser;
        }

        return [
            'tokens' => array_values(array_unique($tokens)),
            'emails' => array_values(array_unique(array_filter($emails))),
            'users' => $users,
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

        // Telegram — workspace group chat + the leave-requester's personal Telegram
        $icon = $decision === 'approved' ? '✅' : '❌';
        $tgText = sprintf(
            "%s <b>Leave request %s</b>\n%s — %s",
            $icon,
            $decision,
            $employee->getName(),
            $dates,
        );
        $this->sendTelegram($leaveRequest->getWorkspace(), $tgText);
        $this->sendTelegramToUser($linkedUser, $tgText);
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

            $this->emailService->send(
                $owner->getEmail(),
                sprintf('New device used — %s', $employee->getName()),
                'emails/device_anomaly.html.twig',
                [
                    'workspaceName' => $workspace->getName(),
                    'employeeName'  => $employee->getName(),
                    'verb'          => $verb,
                    'deviceLabel'   => $deviceLabel,
                    'timeStr'       => $timeStr,
                ],
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
        if ($owner !== null) {
            $this->sendTelegramToUser($owner, $tgText);
        }
    }

    /**
     * Live ping to the owner the moment an employee clocks in or out. Off by
     * default — gated on the workspace's `telegramCheckinAlertsEnabled` flag
     * so a Telegram-enabled workspace doesn't get flooded with one message
     * per punch unless the owner explicitly opts in. Plan gating happens
     * upstream in CheckinService where this is called.
     *
     * @param string $action 'in' for a check-in, 'out' for a check-out
     */
    public function notifyEmployeeCheckin(Attendance $attendance, string $action): void
    {
        $employee = $attendance->getEmployee();
        $workspace = $attendance->getWorkspace();
        if ($employee === null || $workspace === null) {
            return;
        }

        $setting = $workspace->getSetting();
        if ($setting === null || !$setting->isTelegramCheckinAlertsEnabled()) {
            return;
        }

        $isOut = $action === 'out';
        $verb = $isOut ? 'checked out' : 'checked in';
        $when = $isOut ? $attendance->getCheckOutAt() : $attendance->getCheckInAt();
        $tz = new \DateTimeZone($setting->getTimezone());
        $timeStr = $when !== null ? $when->setTimezone($tz)->format('H:i') : '—';

        $emoji = $isOut ? '🟠' : '🟢';
        $tgText = sprintf(
            "%s <b>%s %s</b> at %s",
            $emoji,
            htmlspecialchars($employee->getName(), ENT_HTML5 | ENT_QUOTES, 'UTF-8'),
            $verb,
            $timeStr,
        );

        // Workspace group chat — sendTelegram is already gated internally on
        // isTelegramNotificationsEnabled + telegramChatId being set, so this
        // is a no-op when the workspace hasn't configured group notifications.
        $this->sendTelegram($workspace, $tgText);

        // Owner DM — linking personal Telegram is itself the opt-in (no gate).
        $owner = $workspace->getOwner();
        if ($owner !== null) {
            $this->sendTelegramToUser($owner, $tgText);
        }
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
     * Send a Telegram message to a user's personal chat. No-op if the user
     * hasn't connected Telegram on the profile page. Unlike the workspace
     * variant this isn't gated by an "enabled" toggle — connecting personal
     * Telegram is itself the opt-in.
     */
    public function sendTelegramToUser(User $user, string $text): void
    {
        $chatId = $user->getTelegramChatId();
        if ($chatId === null || $chatId === '') {
            return;
        }

        $this->telegramService->send($chatId, $text);
    }

    /**
     * Fan a Telegram message out to several users, deduping by chat ID so the
     * owner and a manager who happen to share a chat (rare, but possible when
     * the owner also linked themselves as an employee) only get one copy.
     *
     * @param iterable<User> $users
     */
    public function sendTelegramToUsers(iterable $users, string $text): void
    {
        $seenChatIds = [];
        foreach ($users as $user) {
            $chatId = $user->getTelegramChatId();
            if ($chatId === null || $chatId === '') {
                continue;
            }
            if (isset($seenChatIds[$chatId])) {
                continue;
            }
            $seenChatIds[$chatId] = true;
            $this->telegramService->send($chatId, $text);
        }
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

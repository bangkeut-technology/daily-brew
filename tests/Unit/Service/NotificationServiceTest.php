<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\ClosurePeriod;
use App\Entity\DeviceToken;
use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Repository\DeviceTokenRepository;
use App\Repository\EmployeeRepository;
use App\Service\EmailService;
use App\Service\ExpoPushService;
use App\Service\NotificationService;
use App\Service\TelegramService;
use DateTimeImmutable;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;

#[AllowMockObjectsWithoutExpectations]
class NotificationServiceTest extends TestCase
{
    private ExpoPushService&MockObject $expo;
    private EmailService&MockObject $email;
    private TelegramService&MockObject $telegram;
    private DeviceTokenRepository&Stub $deviceTokenRepo;
    private EmployeeRepository&Stub $employeeRepo;
    private NotificationService $svc;

    protected function setUp(): void
    {
        $this->expo = $this->createMock(ExpoPushService::class);
        $this->email = $this->createMock(EmailService::class);
        $this->telegram = $this->createMock(TelegramService::class);
        $this->deviceTokenRepo = $this->createStub(DeviceTokenRepository::class);
        $this->employeeRepo = $this->createStub(EmployeeRepository::class);
        // Default: no device tokens (so push is a no-op for the user lookup, but the
        // expo.send method is still called with an empty array).
        $this->deviceTokenRepo->method('findBy')->willReturn([]);

        $this->svc = new NotificationService(
            $this->expo,
            $this->email,
            $this->telegram,
            $this->deviceTokenRepo,
            $this->employeeRepo,
        );
    }

    // ── Leave request submitted ───────────────────────────────────────

    public function testNotifyLeaveSubmittedNoOpWhenWorkspaceHasNoOwner(): void
    {
        $req = $this->leaveRequest(workspace: new Workspace(), employeeName: 'Lyhour Huy');
        $this->expo->expects($this->never())->method('send');
        $this->email->expects($this->never())->method('send');

        $this->svc->notifyLeaveRequestSubmitted($req);
    }

    public function testNotifyLeaveSubmittedFiresPushEmailAndTelegramToOwner(): void
    {
        $owner = (new User())->setEmail('owner@dailybrew.work');
        $workspace = $this->workspace($owner, telegramEnabled: true, telegramChatId: '@chat');
        $req = $this->leaveRequest(
            workspace: $workspace,
            employeeName: 'Lyhour Huy',
            start: new DateTimeImmutable('2026-04-10'),
            end: new DateTimeImmutable('2026-04-12'),
            reason: 'medical',
        );

        $this->expo->expects($this->once())
            ->method('send')
            ->with(
                $this->anything(),
                'New leave request',
                $this->stringContains('Lyhour Huy'),
                $this->callback(fn (array $data) => $data['type'] === 'leave_request_submitted'),
            );
        $this->email->expects($this->once())
            ->method('send')
            ->with(
                'owner@dailybrew.work',
                $this->stringContains('Lyhour Huy'),
                'emails/leave_request_submitted.html.twig',
                $this->callback(fn (array $ctx) =>
                    $ctx['employeeName'] === 'Lyhour Huy'
                    && $ctx['reason'] === 'medical'
                ),
            );
        $this->telegram->expects($this->once())
            ->method('send')
            ->with('@chat', $this->stringContains('Reason: medical'));

        $this->svc->notifyLeaveRequestSubmitted($req);
    }

    public function testNotifyLeaveSubmittedSkipsTelegramWhenDisabled(): void
    {
        $owner = (new User())->setEmail('owner@dailybrew.work');
        $workspace = $this->workspace($owner, telegramEnabled: false);
        $req = $this->leaveRequest($workspace, 'Lyhour Huy');

        $this->expo->expects($this->once())->method('send');
        $this->email->expects($this->once())->method('send');
        $this->telegram->expects($this->never())->method('send');

        $this->svc->notifyLeaveRequestSubmitted($req);
    }

    public function testNotifyLeaveSubmittedSkipsTelegramWhenChatIdEmpty(): void
    {
        $owner = (new User())->setEmail('owner@dailybrew.work');
        $workspace = $this->workspace($owner, telegramEnabled: true, telegramChatId: '');
        $req = $this->leaveRequest($workspace, 'Lyhour Huy');

        $this->telegram->expects($this->never())->method('send');

        $this->svc->notifyLeaveRequestSubmitted($req);
    }

    // ── Leave request decision ────────────────────────────────────────

    public function testNotifyLeaveApprovedNoOpWhenEmployeeHasNoLinkedUser(): void
    {
        $req = $this->leaveRequest($this->workspace(new User()), 'Lyhour');
        // employee from leaveRequest helper has no linked user by default
        $this->expo->expects($this->never())->method('send');
        $this->email->expects($this->never())->method('send');

        $this->svc->notifyLeaveRequestApproved($req);
    }

    public function testNotifyLeaveApprovedFiresChannelsToLinkedEmployee(): void
    {
        $linkedUser = (new User())->setEmail('emp@dailybrew.work');
        $workspace = $this->workspace(new User(), telegramEnabled: true, telegramChatId: '@chat');
        $req = $this->leaveRequest($workspace, 'Lyhour Huy', linkedUser: $linkedUser);

        $this->expo->expects($this->once())
            ->method('send')
            ->with(
                $this->anything(),
                'Leave request approved',
                $this->stringContains('approved'),
                $this->callback(fn (array $d) => $d['type'] === 'leave_request_approved'),
            );
        $this->email->expects($this->once())
            ->method('send')
            ->with(
                'emp@dailybrew.work',
                'Leave request approved',
                'emails/leave_request_decision.html.twig',
                $this->callback(fn (array $ctx) => $ctx['decision'] === 'approved'),
            );
        $this->telegram->expects($this->once())
            ->method('send')
            ->with('@chat', $this->stringContains('✅'));

        $this->svc->notifyLeaveRequestApproved($req);
    }

    public function testNotifyLeaveRejectedUsesRejectedDecisionAndIcon(): void
    {
        $linkedUser = (new User())->setEmail('emp@dailybrew.work');
        $workspace = $this->workspace(new User(), telegramEnabled: true, telegramChatId: '@chat');
        $req = $this->leaveRequest($workspace, 'Lyhour Huy', linkedUser: $linkedUser);

        $this->expo->expects($this->once())
            ->method('send')
            ->with(
                $this->anything(),
                'Leave request rejected',
                $this->stringContains('rejected'),
                $this->callback(fn (array $d) => $d['type'] === 'leave_request_rejected'),
            );
        $this->telegram->expects($this->once())
            ->method('send')
            ->with('@chat', $this->stringContains('❌'));

        $this->svc->notifyLeaveRequestRejected($req);
    }

    // ── Shift assigned ────────────────────────────────────────────────

    public function testNotifyShiftAssignedNoOpWhenEmployeeHasNoLinkedUser(): void
    {
        $emp = (new Employee())->setShift(new Shift());
        $emp->setWorkspace(new Workspace());

        $this->expo->expects($this->never())->method('send');

        $this->svc->notifyShiftAssigned($emp);
    }

    public function testNotifyShiftAssignedNoOpWhenShiftIsNull(): void
    {
        $emp = (new Employee())->setLinkedUser(new User());
        $emp->setWorkspace(new Workspace());

        $this->expo->expects($this->never())->method('send');

        $this->svc->notifyShiftAssigned($emp);
    }

    public function testNotifyShiftAssignedSendsAllChannels(): void
    {
        $linkedUser = (new User())->setEmail('emp@dailybrew.work');
        $workspace = $this->workspace(new User(), telegramEnabled: true, telegramChatId: '@chat');
        $shift = (new Shift())
            ->setName('Morning')
            ->setStartTime(new DateTimeImmutable('09:00:00'))
            ->setEndTime(new DateTimeImmutable('17:00:00'));
        $emp = (new Employee())
            ->setFirstName('Lyhour')
            ->setLastName('Huy')
            ->setShift($shift)
            ->setLinkedUser($linkedUser);
        $emp->setWorkspace($workspace);

        $this->expo->expects($this->once())
            ->method('send')
            ->with(
                $this->anything(),
                'Shift assigned',
                $this->stringContains('Morning'),
                $this->callback(fn (array $d) => $d['type'] === 'shift_assigned'),
            );
        $this->email->expects($this->once())
            ->method('send')
            ->with('emp@dailybrew.work', 'Shift assigned — Morning', 'emails/shift_assigned.html.twig', $this->anything());
        $this->telegram->expects($this->once())->method('send');

        $this->svc->notifyShiftAssigned($emp);
    }

    // ── Closure created ───────────────────────────────────────────────

    public function testNotifyClosureCreatedAggregatesOnlyLinkedEmployees(): void
    {
        $workspace = $this->workspace(new User(), telegramEnabled: false);
        $closure = (new ClosurePeriod())
            ->setName('Khmer New Year')
            ->setStartDate(new DateTimeImmutable('2026-04-14'))
            ->setEndDate(new DateTimeImmutable('2026-04-16'))
            ->setWorkspace($workspace);

        $linkedUser1 = (new User())->setEmail('a@x.com');
        $linkedUser2 = (new User())->setEmail('b@x.com');
        $linked1 = (new Employee())->setLinkedUser($linkedUser1);
        $linked2 = (new Employee())->setLinkedUser($linkedUser2);
        $unlinked = new Employee();
        $this->employeeRepo->method('findByWorkspace')->willReturn([$linked1, $linked2, $unlinked]);

        $emailRecipients = null;
        $this->email->expects($this->once())
            ->method('sendToMany')
            ->with($this->callback(function (array $r) use (&$emailRecipients): bool {
                $emailRecipients = $r;
                return true;
            }), $this->anything(), 'emails/closure_created.html.twig', $this->anything());
        $this->expo->expects($this->once())->method('send');

        $this->svc->notifyClosureCreated($closure);

        $this->assertEqualsCanonicalizing(['a@x.com', 'b@x.com'], $emailRecipients);
    }

    // ── Daily summary ─────────────────────────────────────────────────

    public function testNotifyDailySummaryNoOpWithoutOwner(): void
    {
        $this->expo->expects($this->never())->method('send');
        $this->email->expects($this->never())->method('send');

        $this->svc->notifyDailySummary(new Workspace(), 10, 7, 1, 2);
    }

    public function testNotifyDailySummaryComputesAbsentAndSendsAllChannels(): void
    {
        $owner = (new User())->setEmail('owner@x.com');
        $workspace = $this->workspace($owner, telegramEnabled: true, telegramChatId: '@chat');
        $workspace->setName('Daily Grind');

        $this->expo->expects($this->once())->method('send');
        $this->email->expects($this->once())
            ->method('send')
            ->with(
                'owner@x.com',
                'Daily Grind — Daily summary',
                'emails/daily_summary.html.twig',
                $this->callback(fn (array $ctx) =>
                    $ctx['totalEmployees'] === 10
                    && $ctx['presentCount'] === 7
                    && $ctx['lateCount'] === 1
                    && $ctx['onLeaveCount'] === 2
                    && $ctx['absentCount'] === 1 // 10 - 7 - 2
                ),
            );
        $this->telegram->expects($this->once())->method('send');

        $this->svc->notifyDailySummary($workspace, 10, 7, 1, 2);
    }

    public function testNotifyDailySummaryClampsAbsentToZero(): void
    {
        $owner = (new User())->setEmail('owner@x.com');
        $workspace = $this->workspace($owner, telegramEnabled: false);

        $this->email->expects($this->once())
            ->method('send')
            ->with(
                $this->anything(), $this->anything(), $this->anything(),
                $this->callback(fn (array $ctx) => $ctx['absentCount'] === 0),
            );

        // 5 active, 4 present + 3 on leave > 5 → absent must clamp to 0.
        $this->svc->notifyDailySummary($workspace, 5, 4, 1, 3);
    }

    // ── Push tokens ──────────────────────────────────────────────────

    public function testGetTokensForUserMapsDeviceTokenEntitiesToStrings(): void
    {
        $owner = (new User())->setEmail('owner@x.com');
        $workspace = $this->workspace($owner, telegramEnabled: false);
        $req = $this->leaveRequest($workspace, 'Lyhour');

        $deviceTokens = [
            $this->deviceToken('ExpoToken[A]'),
            $this->deviceToken('ExpoToken[B]'),
        ];
        // Override the default findBy → empty stub.
        $this->deviceTokenRepo = $this->createStub(DeviceTokenRepository::class);
        $this->deviceTokenRepo->method('findBy')->willReturn($deviceTokens);
        $this->svc = new NotificationService(
            $this->expo,
            $this->email,
            $this->telegram,
            $this->deviceTokenRepo,
            $this->employeeRepo,
        );

        $this->expo->expects($this->once())
            ->method('send')
            ->with(['ExpoToken[A]', 'ExpoToken[B]'], $this->anything(), $this->anything(), $this->anything());

        $this->svc->notifyLeaveRequestSubmitted($req);
    }

    // ── Personal Telegram fan-out ─────────────────────────────────────

    public function testSendTelegramToUserNoOpWhenChatIdIsNull(): void
    {
        $this->telegram->expects($this->never())->method('send');

        $this->svc->sendTelegramToUser(new User(), 'hello');
    }

    public function testSendTelegramToUserNoOpWhenChatIdIsEmptyString(): void
    {
        $user = (new User())->setTelegramChatId('');
        $this->telegram->expects($this->never())->method('send');

        $this->svc->sendTelegramToUser($user, 'hello');
    }

    public function testSendTelegramToUserSendsWhenChatIdPresent(): void
    {
        $user = (new User())->setTelegramChatId('123456789');
        $this->telegram->expects($this->once())
            ->method('send')
            ->with('123456789', 'hello');

        $this->svc->sendTelegramToUser($user, 'hello');
    }

    public function testSendTelegramToUsersDedupesByChatId(): void
    {
        $alice = (new User())->setTelegramChatId('@alice');
        $bob = (new User())->setTelegramChatId('@bob');
        $aliceClone = (new User())->setTelegramChatId('@alice'); // same chat
        $unlinked = new User();

        $this->telegram->expects($this->exactly(2))
            ->method('send')
            ->willReturnCallback(function (string $chatId, string $text): void {
                $this->assertContains($chatId, ['@alice', '@bob']);
                $this->assertSame('msg', $text);
            });

        $this->svc->sendTelegramToUsers([$alice, $bob, $aliceClone, $unlinked], 'msg');
    }

    public function testNotifyLeaveSubmittedAlsoSendsPersonalTelegramToOwner(): void
    {
        $owner = (new User())->setEmail('owner@x.com')->setTelegramChatId('@owner');
        $workspace = $this->workspace($owner, telegramEnabled: true, telegramChatId: '@group');
        $req = $this->leaveRequest($workspace, 'Lyhour Huy');

        // Group + owner-personal = 2 sends, both with the same text.
        $this->telegram->expects($this->exactly(2))
            ->method('send')
            ->willReturnCallback(function (string $chatId, string $text) {
                $this->assertContains($chatId, ['@group', '@owner']);
                $this->assertStringContainsString('New leave request', $text);
            });

        $this->svc->notifyLeaveRequestSubmitted($req);
    }

    public function testNotifyLeaveApprovedAlsoSendsPersonalTelegramToLinkedUser(): void
    {
        $linkedUser = (new User())->setEmail('emp@x.com')->setTelegramChatId('@emp');
        $workspace = $this->workspace(new User(), telegramEnabled: false);
        $req = $this->leaveRequest($workspace, 'Lyhour Huy', linkedUser: $linkedUser);

        // Group is disabled, so only the personal send fires.
        $this->telegram->expects($this->once())
            ->method('send')
            ->with('@emp', $this->stringContains('approved'));

        $this->svc->notifyLeaveRequestApproved($req);
    }

    public function testNotifyShiftAssignedAlsoSendsPersonalTelegramToLinkedUser(): void
    {
        $linkedUser = (new User())->setEmail('emp@x.com')->setTelegramChatId('@emp');
        $workspace = $this->workspace(new User(), telegramEnabled: false);
        $shift = (new Shift())
            ->setName('Morning')
            ->setStartTime(new DateTimeImmutable('09:00:00'))
            ->setEndTime(new DateTimeImmutable('17:00:00'));
        $emp = (new Employee())
            ->setFirstName('Lyhour')
            ->setLastName('Huy')
            ->setShift($shift)
            ->setLinkedUser($linkedUser);
        $emp->setWorkspace($workspace);

        $this->telegram->expects($this->once())
            ->method('send')
            ->with('@emp', $this->stringContains('Shift assigned'));

        $this->svc->notifyShiftAssigned($emp);
    }

    public function testNotifyClosureCreatedAlsoSendsPersonalTelegramToLinkedEmployees(): void
    {
        $workspace = $this->workspace(new User(), telegramEnabled: false);
        $closure = (new ClosurePeriod())
            ->setName('Khmer New Year')
            ->setStartDate(new DateTimeImmutable('2026-04-14'))
            ->setEndDate(new DateTimeImmutable('2026-04-16'))
            ->setWorkspace($workspace);

        $alice = (new User())->setEmail('a@x.com')->setTelegramChatId('@alice');
        $bob = (new User())->setEmail('b@x.com')->setTelegramChatId('@bob');
        $unlinkedEmp = new Employee();
        $linkedNoTg = (new Employee())->setLinkedUser((new User())->setEmail('c@x.com'));
        $linked1 = (new Employee())->setLinkedUser($alice);
        $linked2 = (new Employee())->setLinkedUser($bob);
        $this->employeeRepo->method('findByWorkspace')
            ->willReturn([$linked1, $linked2, $unlinkedEmp, $linkedNoTg]);

        $sentChatIds = [];
        $this->telegram->expects($this->exactly(2))
            ->method('send')
            ->willReturnCallback(function (string $chatId) use (&$sentChatIds): void {
                $sentChatIds[] = $chatId;
            });

        $this->svc->notifyClosureCreated($closure);

        $this->assertEqualsCanonicalizing(['@alice', '@bob'], $sentChatIds);
    }

    public function testNotifyShiftSummaryFansOutPersonalTelegramToOwnerAndManageAttendanceManagers(): void
    {
        $owner = (new User())->setEmail('owner@x.com')->setTelegramChatId('@owner');
        $workspace = $this->workspace($owner, telegramEnabled: false);
        $workspace->setName('Daily Grind');

        $shift = (new Shift())
            ->setName('Morning')
            ->setStartTime(new DateTimeImmutable('09:00:00'))
            ->setEndTime(new DateTimeImmutable('17:00:00'));

        // Workspace has 3 employees: a manager with manage_attendance + linked
        // user + Telegram (should receive); a manager without the permission
        // (should NOT); a regular employee (should NOT, even with Telegram).
        $managerUser = (new User())->setEmail('mgr@x.com')->setTelegramChatId('@mgr');
        $manager = (new Employee())
            ->setFirstName('Bopha')
            ->setLastName('Sok')
            ->setLinkedUser($managerUser)
            ->setRole(\App\Enum\EmployeeRoleEnum::MANAGER)
            ->setStatus(\App\Enum\EmployeeStatusEnum::ACTIVE)
            ->setManagerPermissions([\App\Enum\ManagerPermissionEnum::MANAGE_ATTENDANCE]);
        $manager->setWorkspace($workspace);

        $otherManagerUser = (new User())->setEmail('mgr2@x.com')->setTelegramChatId('@mgr2');
        $otherManager = (new Employee())
            ->setFirstName('Ratha')
            ->setLastName('Pich')
            ->setLinkedUser($otherManagerUser)
            ->setRole(\App\Enum\EmployeeRoleEnum::MANAGER)
            ->setStatus(\App\Enum\EmployeeStatusEnum::ACTIVE)
            ->setManagerPermissions([\App\Enum\ManagerPermissionEnum::MANAGE_LEAVE]);
        $otherManager->setWorkspace($workspace);

        $regularUser = (new User())->setEmail('emp@x.com')->setTelegramChatId('@emp');
        $regular = (new Employee())
            ->setFirstName('Sokha')
            ->setLastName('Nuon')
            ->setLinkedUser($regularUser)
            ->setStatus(\App\Enum\EmployeeStatusEnum::ACTIVE);
        $regular->setWorkspace($workspace);

        $workspace->getEmployees()->add($manager);
        $workspace->getEmployees()->add($otherManager);
        $workspace->getEmployees()->add($regular);

        $summary = [
            'type' => 'start',
            'shift' => $shift,
            'dueAt' => new DateTimeImmutable('2026-04-10T09:00:00+00:00'),
            'total' => 3,
            'onTime' => [$regular],
            'late' => [],
            'missed' => [],
        ];

        $sentChatIds = [];
        $this->telegram->expects($this->exactly(2))
            ->method('send')
            ->willReturnCallback(function (string $chatId) use (&$sentChatIds): void {
                $sentChatIds[] = $chatId;
            });

        $this->svc->notifyShiftSummary($workspace, $summary);

        // Owner + manage-attendance manager only; the manage-leave manager and
        // the regular employee must NOT receive a personal summary.
        $this->assertEqualsCanonicalizing(['@owner', '@mgr'], $sentChatIds);
    }

    public function testNotifyDailySummaryFansOutPersonalTelegramToOwnerAndManageAttendanceManagers(): void
    {
        $owner = (new User())->setEmail('owner@x.com')->setTelegramChatId('@owner');
        $workspace = $this->workspace($owner, telegramEnabled: false);

        $managerUser = (new User())->setEmail('mgr@x.com')->setTelegramChatId('@mgr');
        $manager = (new Employee())
            ->setFirstName('Bopha')
            ->setLastName('Sok')
            ->setLinkedUser($managerUser)
            ->setRole(\App\Enum\EmployeeRoleEnum::MANAGER)
            ->setStatus(\App\Enum\EmployeeStatusEnum::ACTIVE)
            ->setManagerPermissions([\App\Enum\ManagerPermissionEnum::MANAGE_ATTENDANCE]);
        $manager->setWorkspace($workspace);
        $workspace->getEmployees()->add($manager);

        $sentChatIds = [];
        $this->telegram->expects($this->exactly(2))
            ->method('send')
            ->willReturnCallback(function (string $chatId) use (&$sentChatIds): void {
                $sentChatIds[] = $chatId;
            });

        $this->svc->notifyDailySummary($workspace, 10, 7, 1, 2);

        $this->assertEqualsCanonicalizing(['@owner', '@mgr'], $sentChatIds);
    }

    public function testNotifyDeviceAnomalyAlsoSendsPersonalTelegramToOwner(): void
    {
        $owner = (new User())->setEmail('owner@x.com')->setTelegramChatId('@owner');
        $workspace = $this->workspace($owner, telegramEnabled: false);

        $emp = (new Employee())->setFirstName('Lyhour')->setLastName('Huy');
        $emp->setWorkspace($workspace);

        $attendance = new \App\Entity\Attendance();
        $attendance->setEmployee($emp);
        $attendance->setWorkspace($workspace);
        $attendance->setCheckInAt(new DateTimeImmutable('2026-04-10T09:00:00+00:00'));
        $attendance->setCheckInDeviceName('iPhone 17 Pro');
        $attendance->setCheckInDeviceId('device-abc');

        $this->telegram->expects($this->once())
            ->method('send')
            ->with('@owner', $this->stringContains('New device used'));

        $this->svc->notifyDeviceAnomaly($attendance, 'in');
    }

    // ── Per-check-in Telegram alerts ──────────────────────────────────

    public function testNotifyEmployeeCheckinNoOpWhenSettingDisabled(): void
    {
        $owner = (new User())->setEmail('owner@x.com')->setTelegramChatId('@owner');
        $workspace = $this->workspace($owner, telegramEnabled: true, telegramChatId: '-100');
        // workspace() builds a setting with telegramCheckinAlertsEnabled=false by default

        $emp = (new Employee())->setFirstName('Sokha')->setLastName('Sun');
        $emp->setWorkspace($workspace);

        $attendance = new \App\Entity\Attendance();
        $attendance->setEmployee($emp);
        $attendance->setWorkspace($workspace);
        $attendance->setCheckInAt(new DateTimeImmutable('2026-04-10T09:00:00+00:00'));

        // Should never send when the opt-in toggle is off, even if the master
        // Telegram switch is on and a chat ID is configured.
        $this->telegram->expects($this->never())->method('send');

        $this->svc->notifyEmployeeCheckin($attendance, 'in');
    }

    public function testNotifyEmployeeCheckinSendsToWorkspaceAndOwnerWhenEnabled(): void
    {
        $owner = (new User())->setEmail('owner@x.com')->setTelegramChatId('@owner');
        $workspace = $this->workspace(
            $owner,
            telegramEnabled: true,
            telegramChatId: '-100',
            telegramCheckinAlertsEnabled: true,
        );

        $emp = (new Employee())->setFirstName('Sokha')->setLastName('Sun');
        $emp->setWorkspace($workspace);

        $attendance = new \App\Entity\Attendance();
        $attendance->setEmployee($emp);
        $attendance->setWorkspace($workspace);
        $attendance->setCheckInAt(new DateTimeImmutable('2026-04-10T09:00:00+00:00'));

        // Two sends: workspace group + owner DM
        $sentChatIds = [];
        $this->telegram->expects($this->exactly(2))
            ->method('send')
            ->willReturnCallback(function (string $chatId, string $text) use (&$sentChatIds): void {
                $this->assertStringContainsString('Sokha Sun', $text);
                $this->assertStringContainsString('checked in', $text);
                $sentChatIds[] = $chatId;
            });

        $this->svc->notifyEmployeeCheckin($attendance, 'in');

        $this->assertEqualsCanonicalizing(['-100', '@owner'], $sentChatIds);
    }

    public function testNotifyDeviceAnomalyAlsoEmailsOwner(): void
    {
        $owner = (new User())->setEmail('owner@x.com');
        $workspace = $this->workspace($owner, telegramEnabled: false);

        $emp = (new Employee())->setFirstName('Lyhour')->setLastName('Huy');
        $emp->setWorkspace($workspace);

        $attendance = new \App\Entity\Attendance();
        $attendance->setEmployee($emp);
        $attendance->setWorkspace($workspace);
        $attendance->setCheckInAt(new DateTimeImmutable('2026-04-10T09:00:00+00:00'));
        $attendance->setCheckInDeviceName('iPhone 17 Pro');
        $attendance->setCheckInDeviceId('device-abc');

        $this->email->expects($this->once())
            ->method('send')
            ->with(
                'owner@x.com',
                $this->stringContains('New device used'),
                'emails/device_anomaly.html.twig',
                $this->callback(static fn(array $vars): bool => $vars['employeeName'] === 'Lyhour Huy'
                    && $vars['verb'] === 'checked in'
                    && $vars['deviceLabel'] === 'iPhone 17 Pro'),
            );

        $this->svc->notifyDeviceAnomaly($attendance, 'in');
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private function workspace(
        ?User $owner,
        bool $telegramEnabled = false,
        ?string $telegramChatId = null,
        bool $telegramCheckinAlertsEnabled = false,
    ): Workspace {
        $ws = new Workspace();
        $ws->setName('Test Workspace');
        if ($owner !== null) {
            $ws->setOwner($owner);
        }
        $setting = new WorkspaceSetting();
        $setting->setTelegramNotificationsEnabled($telegramEnabled);
        if ($telegramChatId !== null) {
            $setting->setTelegramChatId($telegramChatId);
        }
        $setting->setTelegramCheckinAlertsEnabled($telegramCheckinAlertsEnabled);
        $ws->setSetting($setting);
        return $ws;
    }

    private function leaveRequest(
        Workspace $workspace,
        string $employeeName,
        ?\DateTimeImmutable $start = null,
        ?\DateTimeImmutable $end = null,
        ?string $reason = null,
        ?User $linkedUser = null,
    ): LeaveRequest {
        [$first, $last] = array_pad(explode(' ', $employeeName, 2), 2, '');
        $emp = (new Employee())
            ->setFirstName($first)
            ->setLastName($last);
        $emp->setWorkspace($workspace);
        if ($linkedUser !== null) {
            $emp->setLinkedUser($linkedUser);
        }

        return (new LeaveRequest())
            ->setEmployee($emp)
            ->setWorkspace($workspace)
            ->setStartDate($start ?? new DateTimeImmutable('2026-04-10'))
            ->setEndDate($end ?? new DateTimeImmutable('2026-04-10'))
            ->setReason($reason);
    }

    private function deviceToken(string $token): DeviceToken
    {
        $dt = new DeviceToken();
        $ref = new \ReflectionClass($dt);
        $ref->getProperty('token')->setValue($dt, $token);
        return $dt;
    }
}

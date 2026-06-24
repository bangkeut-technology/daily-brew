<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\ClosurePeriod;
use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\LeaveRequestStatusEnum;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\LeaveRequestService;
use App\Service\NotificationService;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class LeaveRequestServiceTest extends TestCase
{
    private ClosurePeriodRepository&Stub $closureRepo;
    private LeaveRequestRepository&MockObject $leaveRepo;
    private NotificationService&MockObject $notifications;
    private LeaveRequestService $svc;

    protected function setUp(): void
    {
        $this->closureRepo = $this->createStub(ClosurePeriodRepository::class);
        $this->leaveRepo = $this->createMock(LeaveRequestRepository::class);
        $this->notifications = $this->createMock(NotificationService::class);
        $this->svc = new LeaveRequestService(
            $this->closureRepo,
            $this->leaveRepo,
            $this->notifications,
        );
    }

    public function testCreateRejectsWhenStartDateAfterEndDate(): void
    {
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Start date must be before or equal to end date');

        $this->leaveRepo->expects($this->never())->method('persist');
        $this->notifications->expects($this->never())->method('notifyLeaveRequestSubmitted');

        $this->svc->create(
            $this->employee(),
            new Workspace(),
            new User(),
            new DateTimeImmutable('2026-04-10'),
            new DateTimeImmutable('2026-04-09'),
        );
    }

    public function testCreateRejectsWhenDatesOverlapClosure(): void
    {
        $closure = (new ClosurePeriod())->setName('Khmer New Year');
        $this->closureRepo->method('findOverlappingClosure')->willReturn($closure);

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Khmer New Year');

        $this->leaveRepo->expects($this->never())->method('persist');
        $this->notifications->expects($this->never())->method('notifyLeaveRequestSubmitted');

        $this->svc->create(
            $this->employee(),
            new Workspace(),
            new User(),
            new DateTimeImmutable('2026-04-14'),
            new DateTimeImmutable('2026-04-16'),
        );
    }

    public function testCreateRejectsWhenEmployeeAlreadyHasOverlappingRequest(): void
    {
        $this->closureRepo->method('findOverlappingClosure')->willReturn(null);
        $this->leaveRepo->method('findOverlappingForEmployee')->willReturn(new LeaveRequest());

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('already have a pending or approved leave request');

        $this->leaveRepo->expects($this->never())->method('persist');
        $this->notifications->expects($this->never())->method('notifyLeaveRequestSubmitted');

        $this->svc->create(
            $this->employee(),
            new Workspace(),
            new User(),
            new DateTimeImmutable('2026-04-10'),
            new DateTimeImmutable('2026-04-12'),
        );
    }

    public function testCreatePersistsLeaveAndNotifiesOwnerOnSuccess(): void
    {
        $this->closureRepo->method('findOverlappingClosure')->willReturn(null);
        $this->leaveRepo->method('findOverlappingForEmployee')->willReturn(null);

        $employee = $this->employee();
        $workspace = new Workspace();
        $requestedBy = new User();

        $this->leaveRepo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (LeaveRequest $req) use ($employee, $workspace, $requestedBy): bool {
                return $req->getEmployee() === $employee
                    && $req->getWorkspace() === $workspace
                    && $req->getRequestedBy() === $requestedBy
                    && $req->isFullDay()
                    && $req->getReason() === 'medical';
            }));
        $this->leaveRepo->expects($this->once())->method('flush');
        $this->notifications->expects($this->once())->method('notifyLeaveRequestSubmitted');

        $created = $this->svc->create(
            $employee,
            $workspace,
            $requestedBy,
            new DateTimeImmutable('2026-04-10'),
            new DateTimeImmutable('2026-04-12'),
            'medical',
        );

        $this->assertSame($employee, $created->getEmployee());
        $this->assertTrue($created->isFullDay());
    }

    public function testCreatePersistsPartialDayRequestWhenTimesProvided(): void
    {
        $this->closureRepo->method('findOverlappingClosure')->willReturn(null);
        $this->leaveRepo->method('findOverlappingForEmployee')->willReturn(null);
        $this->leaveRepo->expects($this->once())->method('persist');
        $this->leaveRepo->expects($this->once())->method('flush');
        $this->notifications->expects($this->once())->method('notifyLeaveRequestSubmitted');

        $created = $this->svc->create(
            $this->employee(),
            new Workspace(),
            new User(),
            new DateTimeImmutable('2026-04-10'),
            new DateTimeImmutable('2026-04-10'),
            null,
            new DateTimeImmutable('2026-04-10 09:00:00'),
            new DateTimeImmutable('2026-04-10 12:00:00'),
        );

        $this->assertFalse($created->isFullDay());
    }

    public function testApproveSetsStatusReviewedAtAndNotifies(): void
    {
        $req = new LeaveRequest();
        $reviewer = new User();
        $this->leaveRepo->expects($this->once())->method('flush');
        $this->notifications->expects($this->once())->method('notifyLeaveRequestApproved')->with($req);

        $result = $this->svc->approve($req, $reviewer);

        $this->assertSame(LeaveRequestStatusEnum::APPROVED, $result->getStatus());
        $this->assertSame($reviewer, $result->getReviewedBy());
        $this->assertNotNull($result->getReviewedAt());
    }

    public function testRejectSetsStatusReviewerAndOptionalNote(): void
    {
        $req = new LeaveRequest();
        $reviewer = new User();
        $this->leaveRepo->expects($this->once())->method('flush');
        $this->notifications->expects($this->once())->method('notifyLeaveRequestRejected')->with($req);

        $result = $this->svc->reject($req, $reviewer, 'Insufficient notice');

        $this->assertSame(LeaveRequestStatusEnum::REJECTED, $result->getStatus());
        $this->assertSame($reviewer, $result->getReviewedBy());
        $this->assertSame('Insufficient notice', $result->getReviewNote());
    }

    public function testRejectWithoutNoteLeavesNoteUnchanged(): void
    {
        $req = (new LeaveRequest())->setReviewNote('preserved');
        $this->leaveRepo->expects($this->once())->method('flush');
        $this->notifications->expects($this->once())->method('notifyLeaveRequestRejected');

        $result = $this->svc->reject($req);

        $this->assertSame('preserved', $result->getReviewNote());
    }

    public function testEditRejectsWhenStartDateAfterEndDate(): void
    {
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Start date must be before or equal to end date');

        $this->leaveRepo->expects($this->never())->method('flush');
        $this->notifications->expects($this->never())->method('notifyLeaveRequestSubmitted');

        $this->svc->edit(
            $this->leaveRequest(),
            new DateTimeImmutable('2026-04-10'),
            new DateTimeImmutable('2026-04-09'),
        );
    }

    public function testEditRejectsWhenDatesOverlapClosure(): void
    {
        $closure = (new ClosurePeriod())->setName('Pchum Ben');
        $this->closureRepo->method('findOverlappingClosure')->willReturn($closure);

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Pchum Ben');

        $this->leaveRepo->expects($this->never())->method('flush');
        $this->notifications->expects($this->never())->method('notifyLeaveRequestSubmitted');

        $this->svc->edit(
            $this->leaveRequest(),
            new DateTimeImmutable('2026-04-14'),
            new DateTimeImmutable('2026-04-16'),
        );
    }

    public function testEditRejectsWhenAnotherOverlappingRequestExists(): void
    {
        $this->closureRepo->method('findOverlappingClosure')->willReturn(null);
        $this->leaveRepo->method('findOverlappingForEmployee')->willReturn(new LeaveRequest());

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('already has a pending or approved leave request');

        $this->leaveRepo->expects($this->never())->method('flush');
        $this->notifications->expects($this->never())->method('notifyLeaveRequestSubmitted');

        $this->svc->edit(
            $this->leaveRequest(),
            new DateTimeImmutable('2026-04-10'),
            new DateTimeImmutable('2026-04-12'),
        );
    }

    public function testEditUpdatesDatesReasonAndTimesOnSuccess(): void
    {
        $this->closureRepo->method('findOverlappingClosure')->willReturn(null);
        $this->leaveRepo->method('findOverlappingForEmployee')->willReturn(null);
        $this->leaveRepo->expects($this->once())->method('flush');
        // Editing is a manager fix-up — it must not re-notify like a fresh submission.
        $this->notifications->expects($this->never())->method('notifyLeaveRequestSubmitted');

        $req = $this->leaveRequest();
        $result = $this->svc->edit(
            $req,
            new DateTimeImmutable('2026-04-20'),
            new DateTimeImmutable('2026-04-22'),
            'updated reason',
            new DateTimeImmutable('2026-04-20 09:00:00'),
            new DateTimeImmutable('2026-04-20 12:00:00'),
        );

        $this->assertSame('2026-04-20', $result->getStartDate()?->format('Y-m-d'));
        $this->assertSame('2026-04-22', $result->getEndDate()?->format('Y-m-d'));
        $this->assertSame('updated reason', $result->getReason());
        $this->assertFalse($result->isFullDay());
    }

    public function testEditClearsTimesWhenSwitchingToFullDay(): void
    {
        $this->closureRepo->method('findOverlappingClosure')->willReturn(null);
        $this->leaveRepo->method('findOverlappingForEmployee')->willReturn(null);
        $this->leaveRepo->expects($this->once())->method('flush');
        $this->notifications->expects($this->never())->method('notifyLeaveRequestSubmitted');

        $req = $this->leaveRequest()
            ->setStartTime(new DateTimeImmutable('2026-04-20 09:00:00'))
            ->setEndTime(new DateTimeImmutable('2026-04-20 12:00:00'));

        $result = $this->svc->edit(
            $req,
            new DateTimeImmutable('2026-04-20'),
            new DateTimeImmutable('2026-04-20'),
            'now full day',
        );

        $this->assertTrue($result->isFullDay());
        $this->assertNull($result->getStartTime());
        $this->assertNull($result->getEndTime());
    }

    private function employee(): Employee
    {
        return new Employee();
    }

    private function leaveRequest(): LeaveRequest
    {
        return (new LeaveRequest())
            ->setEmployee($this->employee())
            ->setWorkspace(new Workspace());
    }
}

<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Employee;
use App\Entity\User;
use App\Entity\Workspace;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Repository\RefreshTokenRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Service\AccountDeletionService;
use App\Service\WorkspaceService;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

#[AllowMockObjectsWithoutExpectations]
class AccountDeletionServiceTest extends TestCase
{
    private WorkspaceService&MockObject $workspaceService;
    private WorkspaceRepository&MockObject $workspaceRepo;
    private EmployeeRepository&MockObject $employeeRepo;
    private LeaveRequestRepository&MockObject $leaveRepo;
    private RefreshTokenRepository&MockObject $refreshRepo;
    private UserRepository&MockObject $userRepo;
    private AccountDeletionService $svc;

    protected function setUp(): void
    {
        $this->workspaceService = $this->createMock(WorkspaceService::class);
        $this->workspaceRepo = $this->createMock(WorkspaceRepository::class);
        $this->employeeRepo = $this->createMock(EmployeeRepository::class);
        $this->leaveRepo = $this->createMock(LeaveRequestRepository::class);
        $this->refreshRepo = $this->createMock(RefreshTokenRepository::class);
        $this->userRepo = $this->createMock(UserRepository::class);

        $this->svc = new AccountDeletionService(
            $this->workspaceService,
            $this->workspaceRepo,
            $this->employeeRepo,
            $this->leaveRepo,
            $this->refreshRepo,
            $this->userRepo,
        );
    }

    public function testSoftDeleteRevokesRefreshTokensByEmail(): void
    {
        $user = $this->user('owner@dailybrew.work', id: 42);
        $this->workspaceRepo->method('findByOwner')->willReturn([]);
        $this->employeeRepo->method('findByLinkedUser')->willReturn([]);

        $this->refreshRepo->expects($this->once())
            ->method('revokeByUsername')
            ->with('owner@dailybrew.work');

        $this->svc->softDelete($user);
    }

    public function testSoftDeleteCancelsEachOwnedWorkspaceViaWorkspaceService(): void
    {
        $user = $this->user('owner@dailybrew.work');
        $ws1 = new Workspace();
        $ws2 = new Workspace();
        $this->workspaceRepo->method('findByOwner')->willReturn([$ws1, $ws2]);
        $this->employeeRepo->method('findByLinkedUser')->willReturn([]);

        $this->workspaceService->expects($this->exactly(2))
            ->method('delete')
            ->willReturnCallback(function (Workspace $ws) use ($ws1, $ws2): void {
                $this->assertContains($ws, [$ws1, $ws2]);
            });

        $this->svc->softDelete($user);
    }

    public function testSoftDeleteSoftDeletesEmployeesCreatedByUser(): void
    {
        $user = $this->user('owner@dailybrew.work');
        $this->workspaceRepo->method('findByOwner')->willReturn([]);
        $this->employeeRepo->method('findByLinkedUser')->willReturn([]);

        $this->employeeRepo->expects($this->once())
            ->method('softDeleteByCreator')
            ->with($user, $this->isInstanceOf(\DateTimeImmutable::class));

        $this->svc->softDelete($user);
    }

    public function testSoftDeleteUnlinksAllEmployeeRecordsLinkedToUser(): void
    {
        $user = $this->user('linked@dailybrew.work');
        $linked1 = (new Employee())->setLinkedUser($user);
        $linked2 = (new Employee())->setLinkedUser($user);
        $this->workspaceRepo->method('findByOwner')->willReturn([]);
        $this->employeeRepo->method('findByLinkedUser')->willReturn([$linked1, $linked2]);

        $this->svc->softDelete($user);

        $this->assertNull($linked1->getLinkedUser());
        $this->assertNull($linked2->getLinkedUser());
    }

    public function testSoftDeleteSoftDeletesLeaveRequestsByUser(): void
    {
        $user = $this->user('linked@dailybrew.work');
        $this->workspaceRepo->method('findByOwner')->willReturn([]);
        $this->employeeRepo->method('findByLinkedUser')->willReturn([]);

        $this->leaveRepo->expects($this->once())
            ->method('softDeleteByRequestedBy')
            ->with($user, $this->isInstanceOf(\DateTimeImmutable::class));

        $this->svc->softDelete($user);
    }

    public function testSoftDeleteSuffixesEmailFreesUniqueConstraintsAndDisablesUser(): void
    {
        $user = $this->user('owner@dailybrew.work', id: 42);
        $user->setEmailCanonical('owner@dailybrew.work');
        $user->setGoogleId('google-id-123');
        $user->setAppleId('apple-id-123');
        $user->setCurrentWorkspace(new Workspace());

        $this->workspaceRepo->method('findByOwner')->willReturn([]);
        $this->employeeRepo->method('findByLinkedUser')->willReturn([]);
        $this->userRepo->expects($this->once())->method('flush');

        $this->svc->softDelete($user);

        $this->assertFalse($user->isEnabled());
        $this->assertNotNull($user->getDeletedAt());
        $this->assertNull($user->getCurrentWorkspace());
        $this->assertNull($user->getGoogleId());
        $this->assertNull($user->getAppleId());
        $this->assertStringStartsWith('owner@dailybrew.work_deleted_42_', $user->getEmail());
        $this->assertStringStartsWith('owner@dailybrew.work_deleted_42_', $user->getEmailCanonical());
    }

    private function user(string $email, int $id = 1): User
    {
        $user = new User();
        $user->setEmail($email);
        $ref = new \ReflectionClass($user);
        while ($ref !== false && !$ref->hasProperty('id')) {
            $ref = $ref->getParentClass();
        }
        $ref->getProperty('id')->setValue($user, $id);
        return $user;
    }
}

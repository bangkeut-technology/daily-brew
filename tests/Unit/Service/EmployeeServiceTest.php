<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\EmployeeStatusEnum;
use App\Repository\EmployeeRepository;
use App\Service\EmployeeService;
use App\Service\NotificationService;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

#[AllowMockObjectsWithoutExpectations]
class EmployeeServiceTest extends TestCase
{
    private EmployeeRepository&MockObject $repo;
    private NotificationService&MockObject $notifications;
    private EmployeeService $svc;

    protected function setUp(): void
    {
        $this->repo = $this->createMock(EmployeeRepository::class);
        $this->notifications = $this->createMock(NotificationService::class);
        $this->svc = new EmployeeService($this->repo, $this->notifications);
    }

    public function testCreateAssignsCreatorToWorkspaceOwnerAndPersists(): void
    {
        $owner = $this->user(1);
        $workspace = (new Workspace())->setOwner($owner);
        $shift = new Shift();

        $this->repo->expects($this->once())->method('persist')->with($this->isInstanceOf(Employee::class));
        $this->repo->expects($this->once())->method('flush');

        $emp = $this->svc->create($workspace, 'Lyhour', 'Huy', '012345001', $shift);

        $this->assertSame('Lyhour', $emp->getFirstName());
        $this->assertSame('Huy', $emp->getLastName());
        $this->assertSame('012345001', $emp->getPhoneNumber());
        $this->assertSame($shift, $emp->getShift());
        $this->assertSame($workspace, $emp->getWorkspace());
        $this->assertSame($owner, $emp->getUser());
    }

    public function testUpdateMutatesFieldsAndDoesNotNotifyWhenShiftUnchanged(): void
    {
        $shift = new Shift();
        $emp = (new Employee())->setShift($shift)->setFirstName('Old')->setLastName('Name');

        $this->repo->expects($this->once())->method('flush');
        $this->notifications->expects($this->never())->method('notifyShiftAssigned');

        $result = $this->svc->update($emp, 'New', 'Name', null, $shift);

        $this->assertSame('New', $result->getFirstName());
    }

    public function testUpdateNotifiesWhenShiftChangedToDifferentShift(): void
    {
        $oldShift = new Shift();
        $newShift = new Shift();
        $emp = (new Employee())->setShift($oldShift);

        $this->repo->expects($this->once())->method('flush');
        $this->notifications->expects($this->once())->method('notifyShiftAssigned')->with($emp);

        $this->svc->update($emp, 'A', 'B', null, $newShift);

        $this->assertSame($newShift, $emp->getShift());
    }

    public function testUpdateDoesNotNotifyWhenShiftClearedToNull(): void
    {
        // The notify branch only fires when the new shift is non-null AND different.
        $oldShift = new Shift();
        $emp = (new Employee())->setShift($oldShift);

        $this->repo->expects($this->once())->method('flush');
        $this->notifications->expects($this->never())->method('notifyShiftAssigned');

        $this->svc->update($emp, 'A', 'B', null, null);

        $this->assertNull($emp->getShift());
    }

    public function testUpdateTogglesStatusWhenActiveSpecified(): void
    {
        $emp = new Employee();
        $emp->setStatus(EmployeeStatusEnum::ACTIVE);
        $this->repo->expects($this->once())->method('flush');

        $this->svc->update($emp, 'A', 'B', null, null, false);

        $this->assertSame(EmployeeStatusEnum::INACTIVE, $emp->getStatus());
    }

    public function testLinkUserSetsLinkedUserAndFlushes(): void
    {
        $emp = new Employee();
        $user = new User();
        $this->repo->expects($this->once())->method('flush');

        $result = $this->svc->linkUser($emp, $user);

        $this->assertSame($user, $result->getLinkedUser());
    }

    public function testUnlinkClearsLinkedUserCurrentWorkspaceWhenItMatches(): void
    {
        $workspace = $this->workspaceWithId(7, ownerId: 99);
        $linkedUser = $this->user(2);
        $linkedUser->setCurrentWorkspace($workspace);

        $emp = (new Employee())->setWorkspace($workspace);
        $emp->setLinkedUser($linkedUser);

        $this->repo->expects($this->once())->method('flush');

        $this->svc->linkUser($emp, null);

        $this->assertNull($emp->getLinkedUser());
        $this->assertNull($linkedUser->getCurrentWorkspace());
    }

    public function testUnlinkDoesNotClearCurrentWorkspaceForOwner(): void
    {
        // The user being unlinked also owns the workspace — currentWorkspace must stay.
        $owner = $this->user(99);
        $workspace = $this->workspaceWithId(7);
        $workspace->setOwner($owner);
        $owner->setCurrentWorkspace($workspace);

        $emp = (new Employee())->setWorkspace($workspace);
        $emp->setLinkedUser($owner);

        $this->repo->expects($this->once())->method('flush');

        $this->svc->linkUser($emp, null);

        $this->assertSame($workspace, $owner->getCurrentWorkspace());
    }

    public function testDeleteSoftDeletesAndClearsLinkedUser(): void
    {
        $workspace = $this->workspaceWithId(7, ownerId: 99);
        $linkedUser = $this->user(2);
        $linkedUser->setCurrentWorkspace($workspace);

        $emp = (new Employee())->setWorkspace($workspace);
        $emp->setLinkedUser($linkedUser);

        $this->repo->expects($this->once())->method('flush');

        $this->svc->delete($emp);

        $this->assertNotNull($emp->getDeletedAt());
        $this->assertNull($emp->getLinkedUser());
        $this->assertNull($linkedUser->getCurrentWorkspace());
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private function user(int $id): User
    {
        $user = new User();
        $this->setEntityId($user, $id);
        return $user;
    }

    private function workspaceWithId(int $id, ?int $ownerId = null): Workspace
    {
        $workspace = new Workspace();
        $this->setEntityId($workspace, $id);
        if ($ownerId !== null) {
            $workspace->setOwner($this->user($ownerId));
        }
        return $workspace;
    }

    private function setEntityId(object $entity, int $id): void
    {
        $ref = new \ReflectionClass($entity);
        while ($ref !== false && !$ref->hasProperty('id')) {
            $ref = $ref->getParentClass();
        }
        if ($ref === false) {
            throw new \LogicException('No id property on ' . get_class($entity));
        }
        $ref->getProperty('id')->setValue($entity, $id);
    }
}

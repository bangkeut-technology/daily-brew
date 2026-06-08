<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\EmployeeStatusEnum;
use App\Repository\EmployeeRepository;
use App\Service\DateService;
use App\Service\EmployeeService;
use App\Service\NotificationService;
use DateTimeImmutable;
use DateTimeZone;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

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
        $this->svc = new EmployeeService(
            $this->repo,
            $this->notifications,
            new \App\Service\Image\AvatarImageProcessor(),
        );
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
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
        DateService::setClock(new MockClock('2026-05-12 09:00:00', new DateTimeZone('UTC')));
        $emp = new Employee();
        $emp->setStatus(EmployeeStatusEnum::ACTIVE);
        $this->repo->expects($this->once())->method('flush');

        $this->svc->update($emp, 'A', 'B', null, null, false);

        $this->assertSame(EmployeeStatusEnum::INACTIVE, $emp->getStatus());
    }

    public function testDeactivateStampsLeftAtFromCallerDate(): void
    {
        // Owner picked a back-dated leftAt in the modal; service must honour it
        // rather than overwriting with "now", so historical attendance reflects
        // the actual employment window.
        $emp = (new Employee())->setStatus(EmployeeStatusEnum::ACTIVE);
        $this->repo->expects($this->once())->method('flush');
        $leftAt = new DateTimeImmutable('2026-05-01 00:00:00');

        $this->svc->update($emp, 'A', 'B', null, null, false, $leftAt);

        $this->assertSame(EmployeeStatusEnum::INACTIVE, $emp->getStatus());
        $this->assertEquals($leftAt, $emp->getLeftAt());
    }

    public function testDeactivateWithoutDateDefaultsToNow(): void
    {
        DateService::setClock(new MockClock('2026-05-12 09:00:00', new DateTimeZone('UTC')));
        $emp = (new Employee())->setStatus(EmployeeStatusEnum::ACTIVE);
        $this->repo->expects($this->once())->method('flush');

        $this->svc->update($emp, 'A', 'B', null, null, false);

        $this->assertSame('2026-05-12', $emp->getLeftAt()?->format('Y-m-d'));
    }

    public function testReactivateClearsLeftAt(): void
    {
        $emp = (new Employee())
            ->setStatus(EmployeeStatusEnum::INACTIVE)
            ->setLeftAt(new DateTimeImmutable('2026-05-01'));
        $this->repo->expects($this->once())->method('flush');

        $this->svc->update($emp, 'A', 'B', null, null, true);

        $this->assertSame(EmployeeStatusEnum::ACTIVE, $emp->getStatus());
        $this->assertNull($emp->getLeftAt());
    }

    public function testUpdateAllowsCorrectingLeftAtWhileStillInactive(): void
    {
        // Once deactivated, the owner can re-open the edit form and adjust the
        // leftAt date (Option C hybrid): pass active=false + new leftAt, the
        // service updates the stamp without touching status.
        $emp = (new Employee())
            ->setStatus(EmployeeStatusEnum::INACTIVE)
            ->setLeftAt(new DateTimeImmutable('2026-05-01'));
        $this->repo->expects($this->once())->method('flush');
        $corrected = new DateTimeImmutable('2026-04-20');

        $this->svc->update($emp, 'A', 'B', null, null, false, $corrected);

        $this->assertEquals($corrected, $emp->getLeftAt());
    }

    public function testLinkUserSetsLinkedUserAndFlushes(): void
    {
        DateService::setClock(new MockClock('2026-05-15 14:00:00', new DateTimeZone('UTC')));
        $emp = new Employee();
        $user = new User();
        $this->repo->expects($this->once())->method('flush');

        $result = $this->svc->linkUser($emp, $user);

        $this->assertSame($user, $result->getLinkedUser());
        $this->assertSame('2026-05-15', $result->getLinkedAt()?->format('Y-m-d'));
    }

    public function testUnlinkClearsLinkedAt(): void
    {
        // linkedAt is paired with linkedUser — clearing the relationship clears
        // the anchor so a future re-link gets a fresh timestamp.
        $workspace = $this->workspaceWithId(7, ownerId: 99);
        $emp = (new Employee())->setWorkspace($workspace);
        $emp->setLinkedUser($this->user(2));
        $emp->setLinkedAt(new DateTimeImmutable('2026-05-01 10:00:00'));

        $this->repo->expects($this->once())->method('flush');

        $this->svc->linkUser($emp, null);

        $this->assertNull($emp->getLinkedAt());
    }

    public function testRelinkAfterUnlinkStampsFreshLinkedAt(): void
    {
        // Owner unlinks then re-links the same employee to a different user.
        // The new link date is the right anchor — pre-relink absences shouldn't
        // be counted against the new account.
        DateService::setClock(new MockClock('2026-05-20 09:00:00', new DateTimeZone('UTC')));
        $emp = new Employee();
        $this->repo->expects($this->exactly(3))->method('flush');

        $this->svc->linkUser($emp, $this->user(2));
        DateService::setClock(new MockClock('2026-06-01 09:00:00', new DateTimeZone('UTC')));
        $this->svc->linkUser($emp, null);
        $this->assertNull($emp->getLinkedAt());

        DateService::setClock(new MockClock('2026-06-10 09:00:00', new DateTimeZone('UTC')));
        $this->svc->linkUser($emp, $this->user(3));

        $this->assertSame('2026-06-10', $emp->getLinkedAt()?->format('Y-m-d'));
    }

    public function testRelinkToSameUserDoesNotRestampLinkedAt(): void
    {
        // No real transition — guard against accidentally shifting the anchor
        // forward when callers re-set the same user (idempotent updates).
        $user = $this->user(2);
        $emp = new Employee();
        $emp->setLinkedUser($user);
        $original = new DateTimeImmutable('2026-05-01 10:00:00');
        $emp->setLinkedAt($original);

        DateService::setClock(new MockClock('2026-06-10 09:00:00', new DateTimeZone('UTC')));
        $this->repo->expects($this->once())->method('flush');

        $this->svc->linkUser($emp, $user);

        $this->assertEquals($original, $emp->getLinkedAt());
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
        $emp->setLinkedAt(new DateTimeImmutable('2026-05-01'));

        $this->repo->expects($this->once())->method('flush');

        $this->svc->delete($emp);

        $this->assertNotNull($emp->getDeletedAt());
        $this->assertNull($emp->getLinkedUser());
        $this->assertNull($emp->getLinkedAt());
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

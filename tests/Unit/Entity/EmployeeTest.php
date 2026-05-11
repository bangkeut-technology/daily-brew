<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\EmployeeAttendanceTrackingEnum;
use App\Enum\EmployeeRoleEnum;
use App\Enum\EmployeeStatusEnum;
use DateTimeImmutable;
use Doctrine\Common\Collections\Collection;
use PHPUnit\Framework\TestCase;

class EmployeeTest extends TestCase
{
    public function testDefaultsRoleEmployeeAndActiveStatus(): void
    {
        $emp = new Employee();

        $this->assertSame(EmployeeRoleEnum::EMPLOYEE, $emp->getRole());
        $this->assertFalse($emp->isManager());
        $this->assertSame(EmployeeStatusEnum::ACTIVE, $emp->getStatus());
        $this->assertTrue($emp->isActive());
    }

    public function testNameConcatenatesFirstAndLast(): void
    {
        $emp = (new Employee())->setFirstName('Lyhour')->setLastName('Huy');

        $this->assertSame('Lyhour Huy', $emp->getName());
        $this->assertSame('Lyhour Huy', $emp->getFullName());
    }

    public function testToStringReturnsName(): void
    {
        $emp = (new Employee())->setFirstName('Lyhour')->setLastName('Huy');

        $this->assertSame('Lyhour Huy', (string) $emp);
    }

    public function testIsActiveFlipsWithStatus(): void
    {
        $emp = new Employee();

        $emp->setStatus(EmployeeStatusEnum::INACTIVE);
        $this->assertFalse($emp->isActive());

        $emp->setStatus(EmployeeStatusEnum::ACTIVE);
        $this->assertTrue($emp->isActive());
    }

    public function testIsManagerOnlyTrueForManagerRole(): void
    {
        $emp = (new Employee())->setRole(EmployeeRoleEnum::MANAGER);
        $this->assertTrue($emp->isManager());

        $emp->setRole(EmployeeRoleEnum::EMPLOYEE);
        $this->assertFalse($emp->isManager());
    }

    public function testCollectionsInitializeAsEmpty(): void
    {
        $emp = new Employee();

        $this->assertInstanceOf(Collection::class, $emp->getAttendances());
        $this->assertInstanceOf(Collection::class, $emp->getAssignedQrCodes());
        $this->assertCount(0, $emp->getAttendances());
        $this->assertCount(0, $emp->getAssignedQrCodes());
    }

    public function testProfileFieldsRoundTrip(): void
    {
        $emp = (new Employee())
            ->setFirstName('A')
            ->setLastName('B')
            ->setUsername('a.b')
            ->setPhoneNumber('012345')
            ->setDob(new DateTimeImmutable('1990-01-01'))
            ->setJoinedAt(new DateTimeImmutable('2026-04-01'));

        $this->assertSame('a.b', $emp->getUsername());
        $this->assertSame('012345', $emp->getPhoneNumber());
        $this->assertNotNull($emp->getDob());
        $this->assertSame('1990-01-01', $emp->getDob()->format('Y-m-d'));
        $this->assertSame('2026-04-01', $emp->getJoinedAt()->format('Y-m-d'));
    }

    public function testUserDistinctFromLinkedUser(): void
    {
        // user = the workspace owner who created the employee record
        // linkedUser = the staff member who signed up and got linked to it
        $creator = new User();
        $linkedUser = new User();
        $emp = (new Employee())
            ->setUser($creator)
            ->setLinkedUser($linkedUser);

        $this->assertSame($creator, $emp->getUser());
        $this->assertSame($linkedUser, $emp->getLinkedUser());
        $this->assertNotSame($emp->getUser(), $emp->getLinkedUser());
    }

    public function testRelationshipSettersRoundTripWorkspaceAndShift(): void
    {
        $workspace = new Workspace();
        $shift = new Shift();
        $emp = (new Employee())->setWorkspace($workspace)->setShift($shift);

        $this->assertSame($workspace, $emp->getWorkspace());
        $this->assertSame($shift, $emp->getShift());

        $emp->setShift(null);
        $this->assertNull($emp->getShift());
    }

    public function testSoftDeleteSetsDeletedAt(): void
    {
        $emp = new Employee();

        $this->assertNull($emp->getDeletedAt());

        $now = new DateTimeImmutable();
        $emp->setDeletedAt($now);

        $this->assertSame($now, $emp->getDeletedAt());
    }

    public function testAttendanceTrackingDefaultsToFullAndRoundTrips(): void
    {
        $emp = new Employee();

        $this->assertSame(EmployeeAttendanceTrackingEnum::Full, $emp->getAttendanceTracking());
        $this->assertTrue($emp->isAttendanceTracked());

        $emp->setAttendanceTracking(EmployeeAttendanceTrackingEnum::None);

        $this->assertSame(EmployeeAttendanceTrackingEnum::None, $emp->getAttendanceTracking());
        $this->assertFalse($emp->isAttendanceTracked(), 'None-tracked → isAttendanceTracked() returns false');
    }
}

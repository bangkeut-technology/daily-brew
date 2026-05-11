<?php

declare(strict_types=1);

namespace App\Tests\Unit\DTO;

use App\DTO\EmployeeDTO;
use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\User;
use App\Enum\EmployeeRoleEnum;
use App\Enum\EmployeeStatusEnum;
use App\Enum\ManagerPermissionEnum;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

class EmployeeDTOTest extends TestCase
{
    public function testFromEntityCopiesProfileFieldsAndDefaultsToEmployeeRole(): void
    {
        $emp = (new Employee())
            ->setFirstName('Lyhour')
            ->setLastName('Huy')
            ->setUsername('lyhour.huy')
            ->setPhoneNumber('012345001');

        $dto = EmployeeDTO::fromEntity($emp);

        $this->assertSame('Lyhour', $dto->firstName);
        $this->assertSame('Huy', $dto->lastName);
        $this->assertSame('Lyhour Huy', $dto->name);
        $this->assertSame('lyhour.huy', $dto->username);
        $this->assertSame('012345001', $dto->phoneNumber);
        $this->assertSame('employee', $dto->role);
        $this->assertTrue($dto->active);
        $this->assertSame([], $dto->managerPermissions);
        $this->assertNull($dto->linkedUserPublicId);
        $this->assertNull($dto->linkedUserEmail);
        $this->assertNull($dto->shiftName);
        $this->assertNull($dto->shiftPublicId);
        $this->assertNull($dto->dob);
        $this->assertNull($dto->joinedAt);
    }

    public function testFromEntityFlagsInactiveStatus(): void
    {
        $emp = (new Employee())
            ->setFirstName('A')
            ->setLastName('B')
            ->setStatus(EmployeeStatusEnum::INACTIVE);

        $dto = EmployeeDTO::fromEntity($emp);

        $this->assertFalse($dto->active);
    }

    public function testFromEntityExposesLinkedUserEmailAndPublicIdWhenLinked(): void
    {
        $linked = (new User())->setEmail('emp@dailybrew.work');
        $emp = (new Employee())
            ->setFirstName('A')
            ->setLastName('B')
            ->setLinkedUser($linked);

        $dto = EmployeeDTO::fromEntity($emp);

        $this->assertSame($linked->getPublicId(), $dto->linkedUserPublicId);
        $this->assertSame('emp@dailybrew.work', $dto->linkedUserEmail);
    }

    public function testFromEntityExposesShiftPublicIdAndName(): void
    {
        $shift = (new Shift())->setName('Morning');
        $emp = (new Employee())
            ->setFirstName('A')
            ->setLastName('B')
            ->setShift($shift);

        $dto = EmployeeDTO::fromEntity($emp);

        $this->assertSame('Morning', $dto->shiftName);
        $this->assertSame($shift->getPublicId(), $dto->shiftPublicId);
    }

    public function testFromEntityFormatsDobAndJoinedAtAsIsoDates(): void
    {
        $emp = (new Employee())
            ->setFirstName('A')
            ->setLastName('B')
            ->setDob(new DateTimeImmutable('1990-12-03'))
            ->setJoinedAt(new DateTimeImmutable('2026-01-15'));

        $dto = EmployeeDTO::fromEntity($emp);

        $this->assertSame('1990-12-03', $dto->dob);
        $this->assertSame('2026-01-15', $dto->joinedAt);
    }

    public function testFromEntitySerialisesManagerPermissionValues(): void
    {
        $emp = (new Employee())
            ->setFirstName('A')
            ->setLastName('B')
            ->setRole(EmployeeRoleEnum::MANAGER)
            ->setManagerPermissions([
                ManagerPermissionEnum::MANAGE_LEAVE,
                ManagerPermissionEnum::MANAGE_ATTENDANCE,
            ]);

        $dto = EmployeeDTO::fromEntity($emp);

        $this->assertSame('manager', $dto->role);
        $this->assertEqualsCanonicalizing(
            ['manage_leave', 'manage_attendance'],
            $dto->managerPermissions,
        );
    }

    public function testToArrayContainsEverySerializedField(): void
    {
        $emp = (new Employee())->setFirstName('A')->setLastName('B');

        $array = EmployeeDTO::fromEntity($emp)->toArray();

        foreach ([
            'publicId', 'firstName', 'lastName', 'name', 'username',
            'phoneNumber', 'active', 'role', 'linkedUserPublicId',
            'linkedUserEmail', 'shiftName', 'shiftPublicId',
            'dob', 'joinedAt', 'createdAt', 'managerPermissions',
        ] as $key) {
            $this->assertArrayHasKey($key, $array, "Expected key '$key' in toArray()");
        }
    }
}

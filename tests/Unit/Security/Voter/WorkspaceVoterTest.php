<?php

declare(strict_types=1);

namespace App\Tests\Unit\Security\Voter;

use App\Entity\Attendance;
use App\Entity\ClosurePeriod;
use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceQrCode;
use App\Enum\EmployeeRoleEnum;
use App\Enum\ManagerPermissionEnum;
use App\Repository\EmployeeRepository;
use App\Security\Voter\WorkspaceVoter;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class WorkspaceVoterTest extends TestCase
{
    private EmployeeRepository&Stub $employeeRepository;
    private WorkspaceVoter $voter;

    protected function setUp(): void
    {
        $this->employeeRepository = $this->createStub(EmployeeRepository::class);
        $this->voter = new WorkspaceVoter($this->employeeRepository);
    }

    public function testAbstainsForUnknownAttribute(): void
    {
        $token = $this->tokenFor($this->user(1));
        $workspace = $this->workspaceOwnedBy(1);

        $result = $this->voter->vote($token, $workspace, ['SOME_OTHER_ATTRIBUTE']);

        $this->assertSame(VoterInterface::ACCESS_ABSTAIN, $result);
    }

    public function testAbstainsForUnsupportedSubject(): void
    {
        $token = $this->tokenFor($this->user(1));

        $result = $this->voter->vote($token, new \stdClass(), [WorkspaceVoter::VIEW]);

        $this->assertSame(VoterInterface::ACCESS_ABSTAIN, $result);
    }

    public function testDeniesWhenNoUserOnToken(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn(null);
        $workspace = $this->workspaceOwnedBy(1);

        $result = $this->voter->vote($token, $workspace, [WorkspaceVoter::VIEW]);

        $this->assertSame(VoterInterface::ACCESS_DENIED, $result);
    }

    public function testOwnerCanDoEverything(): void
    {
        $owner = $this->user(42);
        $workspace = $this->workspaceOwnedBy(42);
        $token = $this->tokenFor($owner);

        foreach ([
            WorkspaceVoter::VIEW,
            WorkspaceVoter::EDIT,
            WorkspaceVoter::DELETE,
            WorkspaceVoter::MANAGE,
            WorkspaceVoter::MANAGE_EMPLOYEES,
            WorkspaceVoter::MANAGE_SHIFTS,
            WorkspaceVoter::MANAGE_CLOSURES,
            WorkspaceVoter::MANAGE_LEAVE_REQUESTS,
            WorkspaceVoter::MANAGE_ATTENDANCES,
        ] as $attribute) {
            $this->assertSame(
                VoterInterface::ACCESS_GRANTED,
                $this->voter->vote($token, $workspace, [$attribute]),
                "Owner should be granted $attribute",
            );
        }
    }

    public function testNonMemberDeniedEvenForView(): void
    {
        $user = $this->user(99);
        $workspace = $this->workspaceOwnedBy(1);
        $this->employeeRepository->method('findOneByLinkedUserAndWorkspace')->willReturn(null);

        $result = $this->voter->vote($this->tokenFor($user), $workspace, [WorkspaceVoter::VIEW]);

        $this->assertSame(VoterInterface::ACCESS_DENIED, $result);
    }

    public function testLinkedEmployeeCanView(): void
    {
        $user = $this->user(2);
        $workspace = $this->workspaceOwnedBy(1);
        $employee = $this->managerEmployee([], $workspace);
        $this->employeeRepository->method('findOneByLinkedUserAndWorkspace')->willReturn($employee);

        $result = $this->voter->vote($this->tokenFor($user), $workspace, [WorkspaceVoter::VIEW]);

        $this->assertSame(VoterInterface::ACCESS_GRANTED, $result);
    }

    public function testManagerHasManageOnWorkspaceLegacyAttribute(): void
    {
        $user = $this->user(2);
        $workspace = $this->workspaceOwnedBy(1);
        $employee = $this->managerEmployee([], $workspace);
        $this->employeeRepository->method('findOneByLinkedUserAndWorkspace')->willReturn($employee);

        $result = $this->voter->vote($this->tokenFor($user), $workspace, [WorkspaceVoter::MANAGE]);

        $this->assertSame(VoterInterface::ACCESS_GRANTED, $result);
    }

    public function testCapabilityAttributeRequiresMatchingPermission(): void
    {
        $user = $this->user(2);
        $workspace = $this->workspaceOwnedBy(1);
        $employee = $this->managerEmployee(
            [ManagerPermissionEnum::MANAGE_LEAVE],
            $workspace,
        );
        $this->employeeRepository->method('findOneByLinkedUserAndWorkspace')->willReturn($employee);
        $token = $this->tokenFor($user);

        $this->assertSame(
            VoterInterface::ACCESS_GRANTED,
            $this->voter->vote($token, $workspace, [WorkspaceVoter::MANAGE_LEAVE_REQUESTS]),
        );
        $this->assertSame(
            VoterInterface::ACCESS_DENIED,
            $this->voter->vote($token, $workspace, [WorkspaceVoter::MANAGE_EMPLOYEES]),
        );
        $this->assertSame(
            VoterInterface::ACCESS_DENIED,
            $this->voter->vote($token, $workspace, [WorkspaceVoter::MANAGE_SHIFTS]),
        );
    }

    public function testEditOnEntityResolvesToMatchingCapability(): void
    {
        $user = $this->user(2);
        $workspace = $this->workspaceOwnedBy(1);
        $manager = $this->managerEmployee(
            [ManagerPermissionEnum::MANAGE_SHIFTS],
            $workspace,
        );
        $this->employeeRepository->method('findOneByLinkedUserAndWorkspace')->willReturn($manager);
        $token = $this->tokenFor($user);

        $shift = (new Shift())->setWorkspace($workspace);
        $closure = (new ClosurePeriod())->setWorkspace($workspace);

        $this->assertSame(
            VoterInterface::ACCESS_GRANTED,
            $this->voter->vote($token, $shift, [WorkspaceVoter::EDIT]),
            'manage_shifts grants EDIT on Shift',
        );
        $this->assertSame(
            VoterInterface::ACCESS_DENIED,
            $this->voter->vote($token, $closure, [WorkspaceVoter::EDIT]),
            'manage_shifts does not grant EDIT on ClosurePeriod',
        );
    }

    public function testEditOnWorkspaceSubjectIsOwnerOnly(): void
    {
        $user = $this->user(2);
        $workspace = $this->workspaceOwnedBy(1);
        // Even with every manager permission, EDIT/DELETE on the Workspace itself stays denied.
        $manager = $this->managerEmployee(
            [
                ManagerPermissionEnum::MANAGE_EMPLOYEES,
                ManagerPermissionEnum::MANAGE_SHIFTS,
                ManagerPermissionEnum::MANAGE_CLOSURES,
                ManagerPermissionEnum::MANAGE_LEAVE,
                ManagerPermissionEnum::MANAGE_ATTENDANCE,
            ],
            $workspace,
        );
        $this->employeeRepository->method('findOneByLinkedUserAndWorkspace')->willReturn($manager);
        $token = $this->tokenFor($user);

        $this->assertSame(
            VoterInterface::ACCESS_DENIED,
            $this->voter->vote($token, $workspace, [WorkspaceVoter::EDIT]),
        );
        $this->assertSame(
            VoterInterface::ACCESS_DENIED,
            $this->voter->vote($token, $workspace, [WorkspaceVoter::DELETE]),
        );
    }

    public function testPerQrManagerGrantsManageOnAttendanceForAssignedEmployee(): void
    {
        $user = $this->user(2);
        $workspace = $this->workspaceOwnedBy(1);
        // The per-QR manager is a regular Employee (role=EMPLOYEE) who happens to
        // be the QR's manager — exercising the per-QR fallback in the voter.
        $perQrManager = $this->regularEmployee($workspace);
        $this->setEntityId($perQrManager, 500);
        $this->employeeRepository->method('findOneByLinkedUserAndWorkspace')->willReturn($perQrManager);

        $assignedEmployee = $this->regularEmployee($workspace);
        $this->setEntityId($assignedEmployee, 600);
        $qr = (new WorkspaceQrCode())
            ->setWorkspace($workspace)
            ->setManager($perQrManager);
        $assignedEmployee->getAssignedQrCodes()->add($qr);

        $attendance = (new Attendance())->setEmployee($assignedEmployee);

        $this->assertSame(
            VoterInterface::ACCESS_GRANTED,
            $this->voter->vote($this->tokenFor($user), $attendance, [WorkspaceVoter::MANAGE]),
        );
    }

    public function testPerQrManagerDoesNotGrantManageOnAttendanceForUnassignedEmployee(): void
    {
        $user = $this->user(2);
        $workspace = $this->workspaceOwnedBy(1);
        $perQrManager = $this->regularEmployee($workspace);
        $this->setEntityId($perQrManager, 500);
        $this->employeeRepository->method('findOneByLinkedUserAndWorkspace')->willReturn($perQrManager);

        $unassignedEmployee = $this->regularEmployee($workspace);
        $this->setEntityId($unassignedEmployee, 700);
        // No QR codes assigned to unassignedEmployee.
        $attendance = (new Attendance())->setEmployee($unassignedEmployee);

        $this->assertSame(
            VoterInterface::ACCESS_DENIED,
            $this->voter->vote($this->tokenFor($user), $attendance, [WorkspaceVoter::MANAGE]),
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private function tokenFor(User $user): TokenInterface
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);
        return $token;
    }

    private function user(int $id): User
    {
        $user = new User();
        $this->setEntityId($user, $id);
        return $user;
    }

    private function workspaceOwnedBy(int $ownerId): Workspace
    {
        $workspace = new Workspace();
        $workspace->setOwner($this->user($ownerId));
        return $workspace;
    }

    /** @param list<ManagerPermissionEnum> $permissions */
    private function managerEmployee(array $permissions, Workspace $workspace): Employee
    {
        $employee = new Employee();
        $employee->setWorkspace($workspace);
        $employee->setRole(EmployeeRoleEnum::MANAGER);
        $employee->setManagerPermissions($permissions);
        return $employee;
    }

    private function regularEmployee(Workspace $workspace): Employee
    {
        $employee = new Employee();
        $employee->setWorkspace($workspace);
        $employee->setRole(EmployeeRoleEnum::EMPLOYEE);
        return $employee;
    }

    /**
     * Doctrine entities don't expose id setters; use reflection to seed the id field
     * so identity comparisons (e.g. owner equality) work in unit tests.
     */
    private function setEntityId(object $entity, int $id): void
    {
        $ref = new \ReflectionClass($entity);
        while ($ref !== false && !$ref->hasProperty('id')) {
            $ref = $ref->getParentClass();
        }
        if ($ref === false) {
            throw new \LogicException('No id property on ' . get_class($entity));
        }
        $prop = $ref->getProperty('id');
        // PHP 8.1+ no longer requires setAccessible() for protected/private props
        // accessed via ReflectionProperty; calling it is deprecated in 8.5.
        $prop->setValue($entity, $id);
    }
}

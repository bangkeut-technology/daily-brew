<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\Attendance;
use App\Entity\ClosurePeriod;
use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceQrCode;
use App\Enum\ManagerPermissionEnum;
use App\Repository\EmployeeRepository;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class WorkspaceVoter extends Voter
{
    public const string VIEW = 'WORKSPACE_VIEW';
    public const string EDIT = 'WORKSPACE_EDIT';
    public const string DELETE = 'WORKSPACE_DELETE';
    public const string MANAGE = 'WORKSPACE_MANAGE';

    /**
     * Capability attributes — owner-or-manager-with-the-permission. Use these on create/list endpoints
     * where the subject is the Workspace (no specific entity exists yet). For update/delete on an
     * existing entity, prefer EDIT/DELETE with the entity itself as the subject — the voter will
     * resolve the matching capability automatically.
     */
    public const string MANAGE_EMPLOYEES = 'WORKSPACE_MANAGE_EMPLOYEES';
    public const string MANAGE_SHIFTS = 'WORKSPACE_MANAGE_SHIFTS';
    public const string MANAGE_CLOSURES = 'WORKSPACE_MANAGE_CLOSURES';
    public const string MANAGE_LEAVE_REQUESTS = 'WORKSPACE_MANAGE_LEAVE_REQUESTS';
    public const string MANAGE_ATTENDANCES = 'WORKSPACE_MANAGE_ATTENDANCES';

    private const array CAPABILITY_MAP = [
        self::MANAGE_EMPLOYEES => 'manage_employees',
        self::MANAGE_SHIFTS => 'manage_shifts',
        self::MANAGE_CLOSURES => 'manage_closures',
        self::MANAGE_LEAVE_REQUESTS => 'manage_leave',
        self::MANAGE_ATTENDANCES => 'manage_attendance',
    ];

    public function __construct(
        private readonly EmployeeRepository $employeeRepository,
    ) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        $known = [self::VIEW, self::EDIT, self::DELETE, self::MANAGE, ...array_keys(self::CAPABILITY_MAP)];
        if (!in_array($attribute, $known, true)) {
            return false;
        }

        return $subject instanceof Workspace
            || $subject instanceof Employee
            || $subject instanceof Shift
            || $subject instanceof ClosurePeriod
            || $subject instanceof Attendance
            || $subject instanceof LeaveRequest
            || $subject instanceof WorkspaceQrCode;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?Vote $vote = null): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        $workspace = $this->resolveWorkspace($subject);
        if ($workspace === null) {
            return false;
        }

        $isOwner = $workspace->getOwner()?->getId() === $user->getId();

        // Owner can do everything
        if ($isOwner) {
            return true;
        }

        $employee = $this->employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        if ($employee === null) {
            return false;
        }

        // MANAGE: owner, workspace-wide manager, or per-QR manager scoped to subject
        if ($attribute === self::MANAGE) {
            if ($employee->isManager()) {
                return true;
            }

            return $this->isPerQrManagerForSubject($employee, $subject);
        }

        // VIEW: any linked employee
        if ($attribute === self::VIEW) {
            return true;
        }

        // Capability attributes (MANAGE_EMPLOYEES, MANAGE_SHIFTS, …)
        if (isset(self::CAPABILITY_MAP[$attribute])) {
            $perm = ManagerPermissionEnum::from(self::CAPABILITY_MAP[$attribute]);
            return $employee->hasManagerPermission($perm);
        }

        // EDIT/DELETE on a typed entity: resolve to the matching capability.
        if ($attribute === self::EDIT || $attribute === self::DELETE) {
            $required = $this->requiredPermissionFor($subject);
            if ($required !== null && $employee->hasManagerPermission($required)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Map a voter subject to the manager permission that would unlock EDIT/DELETE on it.
     * Returns null when no manager permission can grant access (e.g. Workspace settings, QR codes).
     */
    private function requiredPermissionFor(mixed $subject): ?ManagerPermissionEnum
    {
        if ($subject instanceof Employee) {
            return ManagerPermissionEnum::MANAGE_EMPLOYEES;
        }

        if ($subject instanceof Shift) {
            return ManagerPermissionEnum::MANAGE_SHIFTS;
        }

        if ($subject instanceof ClosurePeriod) {
            return ManagerPermissionEnum::MANAGE_CLOSURES;
        }

        if ($subject instanceof Attendance) {
            return ManagerPermissionEnum::MANAGE_ATTENDANCE;
        }

        if ($subject instanceof LeaveRequest) {
            return ManagerPermissionEnum::MANAGE_LEAVE;
        }

        return null;
    }

    /**
     * A per-QR manager has MANAGE rights only on Attendance / LeaveRequest
     * for an employee assigned to a QR they manage.
     */
    private function isPerQrManagerForSubject(Employee $managerEmployee, mixed $subject): bool
    {
        $subjectEmployee = match (true) {
            $subject instanceof Attendance, $subject instanceof LeaveRequest => $subject->getEmployee(),
            default => null,
        };

        if ($subjectEmployee === null) {
            return false;
        }

        foreach ($subjectEmployee->getAssignedQrCodes() as $qrCode) {
            if ($qrCode->getManager()?->getId() === $managerEmployee->getId()) {
                return true;
            }
        }

        return false;
    }

    private function resolveWorkspace(mixed $subject): ?Workspace
    {
        if ($subject instanceof Workspace) {
            return $subject;
        }

        if ($subject instanceof Employee || $subject instanceof Shift || $subject instanceof ClosurePeriod) {
            return $subject->getWorkspace();
        }

        if ($subject instanceof Attendance || $subject instanceof LeaveRequest) {
            return $subject->getEmployee()?->getWorkspace();
        }

        if ($subject instanceof WorkspaceQrCode) {
            return $subject->getWorkspace();
        }

        return null;
    }
}

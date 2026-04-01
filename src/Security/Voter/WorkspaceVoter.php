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

    public function __construct(
        private readonly EmployeeRepository $employeeRepository,
    ) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, [self::VIEW, self::EDIT, self::DELETE, self::MANAGE])) {
            return false;
        }

        return $subject instanceof Workspace
            || $subject instanceof Employee
            || $subject instanceof Shift
            || $subject instanceof ClosurePeriod
            || $subject instanceof Attendance
            || $subject instanceof LeaveRequest;
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

        // MANAGE: owner or manager (approve/reject leave, view all attendance)
        if ($attribute === self::MANAGE) {
            return $employee->isManager();
        }

        // VIEW: any linked employee
        if ($attribute === self::VIEW) {
            return true;
        }

        // EDIT and DELETE are owner-only
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

        return null;
    }
}

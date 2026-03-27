<?php

namespace App\Security\Voter;

use App\Entity\Attendance;
use App\Entity\ClosurePeriod;
use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class WorkspaceVoter extends Voter
{
    public const string VIEW = 'WORKSPACE_VIEW';
    public const string EDIT = 'WORKSPACE_EDIT';
    public const string DELETE = 'WORKSPACE_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, [self::VIEW, self::EDIT, self::DELETE])) {
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

        return $workspace->getOwner()->getId() === $user->getId();
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
            return $subject->getEmployee()->getWorkspace();
        }

        return null;
    }
}

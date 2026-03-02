<?php
/**
 * This file is part of the DailyBrew project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 1/6/26 12:43 PM
 *
 * @see     https://dailybrew.work
 */

namespace App\Security\Voter;

use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceAllowedIp;
use App\Entity\WorkspaceInvite;
use App\Enum\WorkspaceRoleEnum;
use App\Repository\WorkspaceUserRepository;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 *
 * Class WorkspaceVoter
 *
 * @package App\Security\Voter;
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class WorkspaceVoter extends Voter
{
    public const string ADD_MEMBER = 'WORKSPACE_INVITE_CREATE';
    public const string VIEW_INVITES = 'WORKSPACE_INVITE_LIST';
    public const string REVOKE_INVITE = 'WORKSPACE_INVITE_REVOKE';
    public const string MANAGE_ALLOWED_IPS = 'WORKSPACE_MANAGE_ALLOWED_IPS';
    public const string MANAGE_PAYROLL = 'WORKSPACE_MANAGE_PAYROLL';
    public const string VIEW_PAYROLL = 'WORKSPACE_VIEW_PAYROLL';

    public function __construct(
        private readonly WorkspaceUserRepository $workspaceUserRepository,
    )
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, [
            self::ADD_MEMBER,
            self::VIEW_INVITES,
            self::REVOKE_INVITE,
            self::MANAGE_ALLOWED_IPS,
            self::MANAGE_PAYROLL,
            self::VIEW_PAYROLL,
        ], true)) {
            return false;
        }

        return $subject instanceof Workspace
            || $subject instanceof WorkspaceInvite
            || $subject instanceof WorkspaceAllowedIp;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        $workspace = match (true) {
            $subject instanceof Workspace => $subject,
            $subject instanceof WorkspaceInvite => $subject->getWorkspace(),
            $subject instanceof WorkspaceAllowedIp => $subject->getWorkspace(),
            default => null,
        };

        if (null === $workspace) {
            return false;
        }

        if (null === $membership = $this->workspaceUserRepository->findByWorkspaceAndUser($workspace, $user)) {
            return false;
        }

        $role = $membership->getRole();

        return match ($attribute) {
            self::VIEW_INVITES => $this->canList($role),
            self::ADD_MEMBER => $this->canCreate($role),
            self::REVOKE_INVITE => $this->canRevoke($role),
            self::MANAGE_ALLOWED_IPS => $this->canManageAllowedIps($role),
            self::MANAGE_PAYROLL => $this->canManagePayroll($role),
            self::VIEW_PAYROLL => $this->canViewPayroll($role),
            default => false,
        };
    }

    private function canList(WorkspaceRoleEnum $role): bool
    {
        return in_array($role, [WorkspaceRoleEnum::OWNER, WorkspaceRoleEnum::ADMIN, WorkspaceRoleEnum::MANAGER], true);
    }

    private function canCreate(WorkspaceRoleEnum $role): bool
    {
        return in_array($role, [WorkspaceRoleEnum::OWNER, WorkspaceRoleEnum::ADMIN, WorkspaceRoleEnum::MANAGER], true);
    }

    private function canRevoke(WorkspaceRoleEnum $role): bool
    {
        return in_array($role, [WorkspaceRoleEnum::OWNER, WorkspaceRoleEnum::ADMIN, WorkspaceRoleEnum::MANAGER], true);
    }

    private function canManageAllowedIps(WorkspaceRoleEnum $role): bool
    {
        return in_array($role, [WorkspaceRoleEnum::OWNER, WorkspaceRoleEnum::ADMIN], true);
    }

    private function canManagePayroll(WorkspaceRoleEnum $role): bool
    {
        return in_array($role, [WorkspaceRoleEnum::OWNER, WorkspaceRoleEnum::ADMIN], true);
    }

    private function canViewPayroll(WorkspaceRoleEnum $role): bool
    {
        return in_array($role, [WorkspaceRoleEnum::OWNER, WorkspaceRoleEnum::ADMIN, WorkspaceRoleEnum::MANAGER], true);
    }
}

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

    public function __construct(
        private readonly WorkspaceUserRepository $workspaceUserRepository,
    )
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, [self::ADD_MEMBER, self::VIEW_INVITES, self::REVOKE_INVITE], true)) {
            return false;
        }

        return $subject instanceof Workspace || $subject instanceof WorkspaceInvite;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        if (null === $membership = $this->workspaceUserRepository->findByWorkspaceAndUser($subject, $user)) {
            return false;
        }

        $role = $membership->getRole();

        return match ($attribute) {
            self::VIEW_INVITES => $this->canList($role),
            self::ADD_MEMBER => $this->canCreate($role),
            self::REVOKE_INVITE => $this->canRevoke($role),
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
}

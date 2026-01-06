<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 1/6/26 8:13 AM
 *
 * @see     https://adora.media
 */

namespace App\Entity;


use App\Enum\WorkspaceInviteStatusEnum;
use App\Enum\WorkspaceRoleEnum;
use App\Repository\WorkspaceInviteRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

/**
 *
 * Class WorkspaceInvite
 *
 * @package App\Entity;
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Entity(repositoryClass: WorkspaceInviteRepository::class)]
#[ORM\Table(name: 'daily_brew_workspace_invites')]
#[ORM\UniqueConstraint(name: 'UNIQ_WORKSPACE_INVITE_TOKEN', fields: ['token'])]
class WorkspaceInvite extends AbstractEntity
{
    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    private ?Workspace $workspace = null;

    #[ORM\Column(length: 180, nullable: true)]
    private ?string $email = null;

    #[ORM\Column(length: 30, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(length: 50, enumType: WorkspaceRoleEnum::class)]
    private WorkspaceRoleEnum $role = WorkspaceRoleEnum::EMPLOYEE; // member, admin

    #[ORM\OneToOne(targetEntity: Employee::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Employee $employee = null;

    #[ORM\Column(length: 64)]
    private ?string $token = null;

    #[ORM\Column(length: 20, enumType: WorkspaceInviteStatusEnum::class)]
    private WorkspaceInviteStatusEnum $status = WorkspaceInviteStatusEnum::PENDING; // pending, accepted, revoked, expired

    #[ORM\Column]
    private ?DateTimeImmutable $expiresAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $invitedBy = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $acceptedBy = null;

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $acceptedAt = null;

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    /**
     * @return Workspace|null
     */
    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    /**
     * @param Workspace|null $workspace
     *
     * @return WorkspaceInvite
     */
    public function setWorkspace(?Workspace $workspace): WorkspaceInvite
    {
        $this->workspace = $workspace;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getEmail(): ?string
    {
        return $this->email;
    }

    /**
     * @param string|null $email
     *
     * @return WorkspaceInvite
     */
    public function setEmail(?string $email): WorkspaceInvite
    {
        $this->email = $email;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getPhone(): ?string
    {
        return $this->phone;
    }

    /**
     * @param string|null $phone
     *
     * @return WorkspaceInvite
     */
    public function setPhone(?string $phone): WorkspaceInvite
    {
        $this->phone = $phone;
        return $this;
    }

    /**
     * @return WorkspaceRoleEnum
     */
    public function getRole(): WorkspaceRoleEnum
    {
        return $this->role;
    }

    /**
     * @param WorkspaceRoleEnum $role
     *
     * @return WorkspaceInvite
     */
    public function setRole(WorkspaceRoleEnum $role): WorkspaceInvite
    {
        $this->role = $role;
        return $this;
    }

    /**
     * @return Employee|null
     */
    public function getEmployee(): ?Employee
    {
        return $this->employee;
    }

    /**
     * @param Employee|null $employee
     *
     * @return WorkspaceInvite
     */
    public function setEmployee(?Employee $employee): WorkspaceInvite
    {
        $this->employee = $employee;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getToken(): ?string
    {
        return $this->token;
    }

    /**
     * @param string|null $token
     *
     * @return WorkspaceInvite
     */
    public function setToken(?string $token): WorkspaceInvite
    {
        $this->token = $token;
        return $this;
    }

    /**
     * @return WorkspaceInviteStatusEnum
     */
    public function getStatus(): WorkspaceInviteStatusEnum
    {
        return $this->status;
    }

    /**
     * @param WorkspaceInviteStatusEnum $status
     *
     * @return WorkspaceInvite
     */
    public function setStatus(WorkspaceInviteStatusEnum $status): WorkspaceInvite
    {
        $this->status = $status;
        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getExpiresAt(): ?DateTimeImmutable
    {
        return $this->expiresAt;
    }

    /**
     * @param DateTimeImmutable|null $expiresAt
     *
     * @return WorkspaceInvite
     */
    public function setExpiresAt(?DateTimeImmutable $expiresAt): WorkspaceInvite
    {
        $this->expiresAt = $expiresAt;
        return $this;
    }

    /**
     * @return User|null
     */
    public function getInvitedBy(): ?User
    {
        return $this->invitedBy;
    }

    /**
     * @param User|null $invitedBy
     *
     * @return WorkspaceInvite
     */
    public function setInvitedBy(?User $invitedBy): WorkspaceInvite
    {
        $this->invitedBy = $invitedBy;
        return $this;
    }

    /**
     * @return User|null
     */
    public function getAcceptedBy(): ?User
    {
        return $this->acceptedBy;
    }

    /**
     * @param User|null $acceptedBy
     *
     * @return WorkspaceInvite
     */
    public function setAcceptedBy(?User $acceptedBy): WorkspaceInvite
    {
        $this->acceptedBy = $acceptedBy;
        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getAcceptedAt(): ?DateTimeImmutable
    {
        return $this->acceptedAt;
    }

    /**
     * @param DateTimeImmutable|null $acceptedAt
     *
     * @return WorkspaceInvite
     */
    public function setAcceptedAt(?DateTimeImmutable $acceptedAt): WorkspaceInvite
    {
        $this->acceptedAt = $acceptedAt;
        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    /**
     * @param DateTimeImmutable|null $deletedAt
     *
     * @return WorkspaceInvite
     */
    public function setDeletedAt(?DateTimeImmutable $deletedAt): WorkspaceInvite
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    /**
     * Marks the invite as accepted by a user.
     *
     * @param User $user The user who accepted the invite.
     */
    public function markAccepted(User $user): void
    {
        $this->status = WorkspaceInviteStatusEnum::ACCEPTED;
        $this->acceptedBy = $user;
        $this->acceptedAt = new DateTimeImmutable();
    }

    /**
     * Marks the invite as revoked.
     */
    public function markRevoked(): void
    {
        $this->status = WorkspaceInviteStatusEnum::REVOKED;
    }

    /**
     * Marks the invite as expired.
     */
    public function markExpired(): void
    {
        $this->status = WorkspaceInviteStatusEnum::EXPIRED;
    }

    /**
     * Checks if the invite is still acceptable (pending and not expired).
     *
     * @return bool True if the invite can be accepted now, false otherwise.
     */
    public function isAcceptableNow(): bool
    {
        if ($this->status !== WorkspaceInviteStatusEnum::PENDING) {
            return false;
        }
        return $this->expiresAt > new DateTimeImmutable();
    }
}

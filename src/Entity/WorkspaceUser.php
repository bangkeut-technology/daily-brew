<?php
declare(strict_types=1);


namespace App\Entity;

use App\Enum\WorkspaceRoleEnum;
use App\Repository\WorkspaceUserRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class WorkspaceUser
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Entity(repositoryClass: WorkspaceUserRepository::class)]
#[ORM\Table(name: 'daily_brew_workspace_users')]
class WorkspaceUser extends AbstractEntity
{
    #[ORM\Column(enumType: WorkspaceRoleEnum::class)]
    private ?WorkspaceRoleEnum $role = null;

    #[ORM\ManyToOne(inversedBy: 'users')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Workspace $workspace = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'workspaces')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $customName = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    public function getRole(): ?WorkspaceRoleEnum
    {
        return $this->role;
    }

    public function setRole(WorkspaceRoleEnum $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(?Workspace $workspace): static
    {
        $this->workspace = $workspace;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getCustomName(): ?string
    {
        return $this->customName;
    }

    public function setCustomName(?string $customName): static
    {
        $this->customName = $customName;

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
     * @return WorkspaceUser
     */
    public function setDeletedAt(?DateTimeImmutable $deletedAt): WorkspaceUser
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    //--------------
    // Helpers
    //--------------
    public function __toString(): string
    {
        return $this->customName ?? (string)$this->user;
    }

    /**
     * @return bool
     */
    public function isOwner(): bool
    {
        return $this->role === WorkspaceRoleEnum::OWNER;
    }
}

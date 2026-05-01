<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\AdminAuditActionEnum;
use App\Repository\AdminAuditLogRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Append-only record of admin actions taken from /admin. Recorded server-side
 * — never trust client-supplied audit entries.
 */
#[ORM\Table(name: 'daily_brew_admin_audit_logs')]
#[ORM\Entity(repositoryClass: AdminAuditLogRepository::class)]
#[ORM\Index(name: 'IDX_AUDIT_CREATED', columns: ['created_at'])]
#[ORM\Index(name: 'IDX_AUDIT_TARGET', columns: ['target_type', 'target_public_id'])]
class AdminAuditLog extends AbstractBaseEntity
{
    /** The admin user who took the action. SET NULL on user delete (audit history outlives the actor). */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $actor = null;

    /** Snapshot of the actor's email at the time of the action — survives actor deletion. */
    #[ORM\Column(length: 180, nullable: true)]
    private ?string $actorEmail = null;

    #[ORM\Column(length: 40, enumType: AdminAuditActionEnum::class)]
    private AdminAuditActionEnum $action;

    /** e.g. 'user', 'workspace', 'subscription'. */
    #[ORM\Column(length: 30)]
    private string $targetType;

    /** Public ID of the affected entity. Stored as text so the audit row survives entity deletion. */
    #[ORM\Column(length: 36, nullable: true)]
    private ?string $targetPublicId = null;

    /** Human-readable label of the target at action time (e.g. user email or workspace name). */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $targetLabel = null;

    /** @var array<string, mixed>|null */
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $metadata = null;

    public function getActor(): ?User
    {
        return $this->actor;
    }

    public function setActor(?User $actor): static
    {
        $this->actor = $actor;
        return $this;
    }

    public function getActorEmail(): ?string
    {
        return $this->actorEmail;
    }

    public function setActorEmail(?string $actorEmail): static
    {
        $this->actorEmail = $actorEmail;
        return $this;
    }

    public function getAction(): AdminAuditActionEnum
    {
        return $this->action;
    }

    public function setAction(AdminAuditActionEnum $action): static
    {
        $this->action = $action;
        return $this;
    }

    public function getTargetType(): string
    {
        return $this->targetType;
    }

    public function setTargetType(string $targetType): static
    {
        $this->targetType = $targetType;
        return $this;
    }

    public function getTargetPublicId(): ?string
    {
        return $this->targetPublicId;
    }

    public function setTargetPublicId(?string $targetPublicId): static
    {
        $this->targetPublicId = $targetPublicId;
        return $this;
    }

    public function getTargetLabel(): ?string
    {
        return $this->targetLabel;
    }

    public function setTargetLabel(?string $targetLabel): static
    {
        $this->targetLabel = $targetLabel;
        return $this;
    }

    /** @return array<string, mixed>|null */
    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    /** @param array<string, mixed>|null $metadata */
    public function setMetadata(?array $metadata): static
    {
        $this->metadata = $metadata;
        return $this;
    }
}

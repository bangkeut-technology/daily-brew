<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\WorkspaceInvite;
use App\Enum\WorkspaceInviteStatusEnum;
use App\Enum\WorkspaceRoleEnum;
use DateTimeImmutable;

final readonly class WorkspaceInviteDTO
{
    use HasEntityMapper;

    public function __construct(
        public string                    $publicId,
        public ?string                   $email,
        public WorkspaceRoleEnum         $role,
        public WorkspaceInviteStatusEnum $status,
        public ?DateTimeImmutable        $expiresAt,
        public ?DateTimeImmutable        $acceptedAt,
        public ?DateTimeImmutable        $createdAt,
    ) {
    }

    public static function fromEntity(WorkspaceInvite $invite): self
    {
        return new self(
            publicId: $invite->publicId,
            email: $invite->getEmail(),
            role: $invite->getRole(),
            status: $invite->getStatus(),
            expiresAt: $invite->getExpiresAt(),
            acceptedAt: $invite->getAcceptedAt(),
            createdAt: $invite->getCreatedAt(),
        );
    }
}

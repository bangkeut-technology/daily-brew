<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\WorkspaceAllowedIp;
use DateTimeImmutable;

final readonly class AllowedIpDTO
{
    use HasEntityMapper;

    public function __construct(
        public int                $id,
        public string             $publicId,
        public string             $ip,
        public ?string            $label,
        public bool               $isActive,
        public ?DateTimeImmutable $createdAt,
        public ?DateTimeImmutable $updatedAt,
    ) {
    }

    public static function fromEntity(WorkspaceAllowedIp $allowedIp): self
    {
        return new self(
            id: $allowedIp->id,
            publicId: $allowedIp->publicId,
            ip: $allowedIp->getIp(),
            label: $allowedIp->getLabel(),
            isActive: $allowedIp->isActive(),
            createdAt: $allowedIp->getCreatedAt(),
            updatedAt: $allowedIp->getUpdatedAt(),
        );
    }
}

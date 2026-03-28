<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\Workspace;

final readonly class WorkspaceDTO
{
    public function __construct(
        public string  $publicId,
        public ?string $name,
        public ?string $ownerPublicId,
        public string  $createdAt,
    ) {}

    public static function fromEntity(Workspace $w): self
    {
        return new self(
            publicId: (string) $w->getPublicId(),
            name: $w->getName(),
            ownerPublicId: $w->getOwner() ? (string) $w->getOwner()->getPublicId() : null,
            createdAt: $w->getCreatedAt()->format('c'),
        );
    }

    public function toArray(): array
    {
        return [
            'publicId' => $this->publicId,
            'name' => $this->name,
            'ownerPublicId' => $this->ownerPublicId,
            'createdAt' => $this->createdAt,
        ];
    }
}

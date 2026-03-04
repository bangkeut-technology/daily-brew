<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\Role;

final readonly class RoleDTO
{
    use HasEntityMapper;

    public function __construct(
        public int     $id,
        public string  $publicId,
        public string  $name,
        public ?string $description,
    ) {
    }

    public static function fromEntity(Role $role): self
    {
        return new self(
            id: $role->id,
            publicId: $role->publicId,
            name: $role->getName(),
            description: $role->getDescription(),
        );
    }
}

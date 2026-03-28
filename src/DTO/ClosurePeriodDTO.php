<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\ClosurePeriod;

final readonly class ClosurePeriodDTO
{
    public function __construct(
        public string $publicId,
        public string $name,
        public string $startDate,
        public string $endDate,
        public string $createdAt,
    ) {}

    public static function fromEntity(ClosurePeriod $c): self
    {
        return new self(
            publicId: (string) $c->getPublicId(),
            name: $c->getName(),
            startDate: $c->getStartDate()->format('Y-m-d'),
            endDate: $c->getEndDate()->format('Y-m-d'),
            createdAt: $c->getCreatedAt()->format('c'),
        );
    }

    public function toArray(): array
    {
        return [
            'publicId' => $this->publicId,
            'name' => $this->name,
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'createdAt' => $this->createdAt,
        ];
    }
}

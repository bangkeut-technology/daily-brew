<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\EvaluationCriteria;

final readonly class EvaluationCriteriaDTO
{
    use HasEntityMapper;

    public function __construct(
        public int     $id,
        public string  $publicId,
        public string  $label,
        public ?string $description,
        public int     $weight,
    ) {
    }

    public static function fromEntity(EvaluationCriteria $criteria): self
    {
        return new self(
            id: $criteria->id,
            publicId: $criteria->publicId,
            label: $criteria->getLabel(),
            description: $criteria->getDescription(),
            weight: $criteria->getWeight(),
        );
    }
}

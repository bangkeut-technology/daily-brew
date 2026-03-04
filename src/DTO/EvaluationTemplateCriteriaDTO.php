<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\EvaluationTemplateCriteria;

final readonly class EvaluationTemplateCriteriaDTO
{
    use HasEntityMapper;

    public function __construct(
        public int                    $id,
        public string                 $publicId,
        public ?int                   $weight,
        public EvaluationCriteriaDTO  $criteria,
    ) {
    }

    public static function fromEntity(EvaluationTemplateCriteria $tc): self
    {
        return new self(
            id: $tc->id,
            publicId: $tc->publicId,
            weight: $tc->getWeight(),
            criteria: EvaluationCriteriaDTO::fromEntity($tc->getCriteria()),
        );
    }
}

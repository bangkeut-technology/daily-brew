<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\EvaluationTemplate;

final class EvaluationTemplateDTO
{
    use HasEntityMapper;

    public function __construct(
        public readonly int     $id,
        public readonly string  $publicId,
        public readonly string  $name,
        public readonly ?string $description,
        public readonly bool    $active,
        public array            $criterias = [],
    ) {
    }

    public static function fromEntity(EvaluationTemplate $template, bool $withCriterias = false): self
    {
        $dto = new self(
            id: $template->id,
            publicId: $template->publicId,
            name: $template->getName(),
            description: $template->getDescription(),
            active: $template->isActive(),
        );

        if ($withCriterias) {
            foreach ($template->getCriterias() as $tc) {
                $dto->criterias[] = EvaluationTemplateCriteriaDTO::fromEntity($tc);
            }
        }

        return $dto;
    }
}

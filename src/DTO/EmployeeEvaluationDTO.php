<?php
declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\EmployeeEvaluation;
use DateTimeImmutable;

/**
 * Class EmployeeEvaluationDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class EmployeeEvaluationDTO
{
    use HasEntityMapper;

    public function __construct(
        public readonly string            $publicId,
        public readonly string            $templateName,
        public readonly DateTimeImmutable $evaluatedAt,
        public readonly ?string           $note = null,
        public readonly ?float            $averageScore = null,
        public array                      $scores = [],
        public ?UserDTO                   $evaluator = null,
    )
    {
    }

    /**
     * Creates a new instance of the class from an EmployeeEvaluation entity.
     *
     * @param EmployeeEvaluation $evaluation    The employee evaluation entity instance.
     * @param bool               $withEvaluator Indicates whether to include the evaluator in the resulting object.
     *
     * @return self Returns an instance of the class populated with data from the provided EmployeeEvaluation entity.
     */
    public static function fromEntity(
        EmployeeEvaluation $evaluation,
        bool               $withEvaluator = false
    ): self
    {
        $class = new self(
            publicId: $evaluation->publicId,
            templateName: $evaluation->getTemplateName(),
            evaluatedAt: $evaluation->getEvaluatedAt(),
            note: $evaluation->getNote(),
            averageScore: $evaluation->getAverageScore(),
            scores: [],
        );

        foreach ($evaluation->getScores() as $score) {
            $class->scores[] = EmployeeScoreDTO::fromEntity($score);
        }

        if ($withEvaluator) {
            $class->evaluator = UserDTO::fromEntity($evaluation->getEvaluator());
        }

        return $class;
    }
}

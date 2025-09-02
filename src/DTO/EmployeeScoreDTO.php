<?php
declare(strict_types=1);

namespace App\DTO;

use App\Entity\EmployeeScore;

/**
 * Class EmployeeScoreDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class EmployeeScoreDTO
{
    public function __construct(
        public string $publicId,
        public string $criteriaLabel,
        public int    $score,
        public int    $weight,
        public string $comment,
    )
    {
    }

    /**
     * Creates a new instance of the class from an EmployeeScore entity.
     *
     * @param EmployeeScore $score The EmployeeScore entity instance.
     *
     * @return self A new instance of the class.
     */
    public static function fromEntity(EmployeeScore $score): self
    {
        return new self(
            publicId: $score->getPublicId(),
            criteriaLabel: $score->getCriteriaLabel(),
            score: $score->getScore(),
            weight: $score->getWeight(),
            comment: $score->getComment(),
        );
    }
}

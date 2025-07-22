<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\EmployeeScoreRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class EmployeeScore.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_employee_scores')]
#[ORM\Entity(repositoryClass: EmployeeScoreRepository::class)]
class EmployeeScore extends AbstractEntity
{
    #[ORM\ManyToOne(inversedBy: 'scores')]
    #[ORM\JoinColumn(nullable: false)]
    private ?EmployeeEvaluation $evaluation = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['employee_score:read'])]
    private ?EvaluationTemplateCriteria $criteria = null;

    #[ORM\Column(length: 255)]
    #[Groups(['employee_score:read'])]
    private ?string $criteriaLabel = null;

    #[ORM\Column]
    #[Groups(['employee_score:read'])]
    private ?int $score = null;

    #[ORM\Column]
    #[Groups(['employee_score:read'])]
    private ?int $weight = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['employee_score:read'])]
    private ?string $comment = null;

    public function getEvaluation(): ?EmployeeEvaluation
    {
        return $this->evaluation;
    }

    public function setEvaluation(?EmployeeEvaluation $evaluation): EmployeeScore
    {
        $this->evaluation = $evaluation;

        return $this;
    }

    public function getCriteria(): ?EvaluationTemplateCriteria
    {
        return $this->criteria;
    }

    public function setCriteria(?EvaluationTemplateCriteria $criteria): EmployeeScore
    {
        $this->criteria = $criteria;

        return $this;
    }

    public function getCriteriaLabel(): ?string
    {
        return $this->criteriaLabel;
    }

    public function setCriteriaLabel(?string $criteriaLabel): EmployeeScore
    {
        $this->criteriaLabel = $criteriaLabel;

        return $this;
    }

    public function getScore(): ?int
    {
        return $this->score;
    }

    public function setScore(?int $score): EmployeeScore
    {
        $this->score = $score;

        return $this;
    }

    public function getWeight(): ?int
    {
        return $this->weight;
    }

    public function setWeight(?int $weight): EmployeeScore
    {
        $this->weight = $weight;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): EmployeeScore
    {
        $this->comment = $comment;

        return $this;
    }
}

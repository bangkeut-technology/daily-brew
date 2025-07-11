<?php
declare(strict_types=1);


namespace App\Entity;

use App\Repository\EmployeeScoreRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class EmployeeScore
 *
 * @package App\Entity
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
    #[ORM\JoinColumn(nullable: false)]
    private ?EvaluationCriteria $criteria = null;

    #[ORM\Column]
    private ?int $score = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $comment = null;

    public function getEvaluation(): ?EmployeeEvaluation
    {
        return $this->evaluation;
    }

    public function setEvaluation(?EmployeeEvaluation $evaluation): static
    {
        $this->evaluation = $evaluation;

        return $this;
    }

    public function getCriteria(): ?EvaluationCriteria
    {
        return $this->criteria;
    }

    public function setCriteria(?EvaluationCriteria $criteria): static
    {
        $this->criteria = $criteria;

        return $this;
    }

    public function getScore(): ?int
    {
        return $this->score;
    }

    public function setScore(int $score): static
    {
        $this->score = $score;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;

        return $this;
    }
}

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
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?EvaluationTemplateCriteria $criteria = null;

    #[ORM\Column(length: 255)]
    private ?string $criteriaLabel = null;

    #[ORM\Column]
    private ?int $score = null;

    #[ORM\Column]
    private ?int $weight = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $comment = null;

    /**
     * @return EmployeeEvaluation|null
     */
    public function getEvaluation(): ?EmployeeEvaluation
    {
        return $this->evaluation;
    }

    /**
     * @param EmployeeEvaluation|null $evaluation
     * @return EmployeeScore
     */
    public function setEvaluation(?EmployeeEvaluation $evaluation): EmployeeScore
    {
        $this->evaluation = $evaluation;
        return $this;
    }

    /**
     * @return EvaluationTemplateCriteria|null
     */
    public function getCriteria(): ?EvaluationTemplateCriteria
    {
        return $this->criteria;
    }

    /**
     * @param EvaluationTemplateCriteria|null $criteria
     * @return EmployeeScore
     */
    public function setCriteria(?EvaluationTemplateCriteria $criteria): EmployeeScore
    {
        $this->criteria = $criteria;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getCriteriaLabel(): ?string
    {
        return $this->criteriaLabel;
    }

    /**
     * @param string|null $criteriaLabel
     * @return EmployeeScore
     */
    public function setCriteriaLabel(?string $criteriaLabel): EmployeeScore
    {
        $this->criteriaLabel = $criteriaLabel;
        return $this;
    }

    /**
     * @return int|null
     */
    public function getScore(): ?int
    {
        return $this->score;
    }

    /**
     * @param int|null $score
     * @return EmployeeScore
     */
    public function setScore(?int $score): EmployeeScore
    {
        $this->score = $score;
        return $this;
    }

    /**
     * @return int|null
     */
    public function getWeight(): ?int
    {
        return $this->weight;
    }

    /**
     * @param int|null $weight
     * @return EmployeeScore
     */
    public function setWeight(?int $weight): EmployeeScore
    {
        $this->weight = $weight;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getComment(): ?string
    {
        return $this->comment;
    }

    /**
     * @param string|null $comment
     * @return EmployeeScore
     */
    public function setComment(?string $comment): EmployeeScore
    {
        $this->comment = $comment;
        return $this;
    }
}

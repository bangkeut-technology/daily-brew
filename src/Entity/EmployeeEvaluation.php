<?php
declare(strict_types=1);


namespace App\Entity;

use App\Repository\EmployeeEvaluationRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class EmployeeEvaluation
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_employee_evaluations')]
#[ORM\Entity(repositoryClass: EmployeeEvaluationRepository::class)]
#[ORM\UniqueConstraint(name: 'UQ_EMPLOYEE_EVALUATION', columns: ['evaluated_at', 'employee_id', 'template_name'])]
class EmployeeEvaluation extends AbstractEntity
{
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Employee $employee = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $evaluator = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?EvaluationTemplate $template = null;

    #[ORM\Column]
    private ?string $templateName = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: false)]
    private DateTimeImmutable $evaluatedAt;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    #[ORM\Column]
    private ?float $average = null;

    /**
     * @var Collection<int, EmployeeScore>
     */
    #[ORM\OneToMany(targetEntity: EmployeeScore::class, mappedBy: 'evaluation', orphanRemoval: true)]
    private Collection $scores;

    public function __construct()
    {
        $this->scores = new ArrayCollection();
    }

    /**
     * @return Employee|null
     */
    public function getEmployee(): ?Employee
    {
        return $this->employee;
    }

    /**
     * @param Employee|null $employee
     * @return EmployeeEvaluation
     */
    public function setEmployee(?Employee $employee): EmployeeEvaluation
    {
        $this->employee = $employee;
        return $this;
    }

    /**
     * @return User|null
     */
    public function getEvaluator(): ?User
    {
        return $this->evaluator;
    }

    /**
     * @param User|null $evaluator
     * @return EmployeeEvaluation
     */
    public function setEvaluator(?User $evaluator): EmployeeEvaluation
    {
        $this->evaluator = $evaluator;
        return $this;
    }

    /**
     * @return EvaluationTemplate|null
     */
    public function getTemplate(): ?EvaluationTemplate
    {
        return $this->template;
    }

    /**
     * @param EvaluationTemplate|null $template
     * @return EmployeeEvaluation
     */
    public function setTemplate(?EvaluationTemplate $template): EmployeeEvaluation
    {
        $this->template = $template;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getTemplateName(): ?string
    {
        return $this->templateName;
    }

    /**
     * @param string|null $templateName
     * @return EmployeeEvaluation
     */
    public function setTemplateName(?string $templateName): EmployeeEvaluation
    {
        $this->templateName = $templateName;
        return $this;
    }

    /**
     * @return DateTimeImmutable
     */
    public function getEvaluatedAt(): DateTimeImmutable
    {
        return $this->evaluatedAt;
    }

    /**
     * @param DateTimeImmutable $evaluatedAt
     * @return EmployeeEvaluation
     */
    public function setEvaluatedAt(DateTimeImmutable $evaluatedAt): EmployeeEvaluation
    {
        $this->evaluatedAt = $evaluatedAt;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getNotes(): ?string
    {
        return $this->notes;
    }

    /**
     * @param string|null $notes
     * @return EmployeeEvaluation
     */
    public function setNotes(?string $notes): EmployeeEvaluation
    {
        $this->notes = $notes;
        return $this;
    }

    /**
     * @return float|null
     */
    public function getAverage(): ?float
    {
        return $this->average;
    }

    /**
     * @param float|null $average
     * @return EmployeeEvaluation
     */
    public function setAverage(?float $average): EmployeeEvaluation
    {
        $this->average = $average;
        return $this;
    }

    /**
     * @return Collection<int, EmployeeScore>
     */
    public function getScores(): Collection
    {
        return $this->scores;
    }

    public function addScore(EmployeeScore $score): static
    {
        if (!$this->scores->contains($score)) {
            $this->scores->add($score);
            $score->setEvaluation($this);
        }

        return $this;
    }

    public function removeScore(EmployeeScore $score): static
    {
        if ($this->scores->removeElement($score) && $score->getEvaluation() === $this) {
            $score->setEvaluation(null);
        }

        return $this;
    }
}

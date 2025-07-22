<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\EmployeeEvaluationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class EmployeeEvaluation.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_employee_evaluations')]
#[ORM\Entity(repositoryClass: EmployeeEvaluationRepository::class)]
#[ORM\UniqueConstraint(name: 'UQ_EMPLOYEE_EVALUATION', columns: ['evaluated_at', 'employee_id', 'template_name'])]
#[ORM\UniqueConstraint(name: 'UQ_EMPLOYEE_EVALUATION_IDENTIFIER', columns: ['identifier'])]
class EmployeeEvaluation extends AbstractEntity
{
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['employee_evaluation:read'])]
    private ?Employee $employee = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['employee_evaluation:read'])]
    private ?User $evaluator = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['employee_evaluation:read'])]
    private ?EvaluationTemplate $template = null;

    #[ORM\Column]
    #[Groups(['employee_evaluation:read'])]
    private ?string $identifier = null;

    #[ORM\Column]
    #[Groups(['employee_evaluation:read'])]
    private ?string $templateName = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: false)]
    #[Groups(['employee_evaluation:read'])]
    private \DateTimeImmutable $evaluatedAt;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['employee_evaluation:read'])]
    private ?string $note = null;

    #[ORM\Column]
    #[Groups(['employee_evaluation:read'])]
    private ?float $averageScore = null;

    /**
     * @var Collection<int, EmployeeScore>
     */
    #[ORM\OneToMany(targetEntity: EmployeeScore::class, mappedBy: 'evaluation', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['employee_evaluation:read'])]
    private Collection $scores;

    public function __construct()
    {
        $this->scores = new ArrayCollection();
    }

    public function getEmployee(): ?Employee
    {
        return $this->employee;
    }

    public function setEmployee(?Employee $employee): EmployeeEvaluation
    {
        $this->employee = $employee;

        return $this;
    }

    public function getEvaluator(): ?User
    {
        return $this->evaluator;
    }

    public function setEvaluator(?User $evaluator): EmployeeEvaluation
    {
        $this->evaluator = $evaluator;

        return $this;
    }

    public function getTemplate(): ?EvaluationTemplate
    {
        return $this->template;
    }

    public function setTemplate(?EvaluationTemplate $template): EmployeeEvaluation
    {
        $this->template = $template;

        return $this;
    }

    public function getIdentifier(): ?string
    {
        return $this->identifier;
    }

    public function setIdentifier(?string $identifier): EmployeeEvaluation
    {
        $this->identifier = $identifier;

        return $this;
    }

    public function getTemplateName(): ?string
    {
        return $this->templateName;
    }

    public function setTemplateName(?string $templateName): EmployeeEvaluation
    {
        $this->templateName = $templateName;

        return $this;
    }

    public function getEvaluatedAt(): \DateTimeImmutable
    {
        return $this->evaluatedAt;
    }

    public function setEvaluatedAt(\DateTimeImmutable $evaluatedAt): EmployeeEvaluation
    {
        $this->evaluatedAt = $evaluatedAt;

        return $this;
    }

    public function getNote(): ?string
    {
        return $this->note;
    }

    public function setNote(?string $note): EmployeeEvaluation
    {
        $this->note = $note;

        return $this;
    }

    public function getAverageScore(): ?float
    {
        return $this->averageScore;
    }

    public function setAverageScore(?float $averageScore): EmployeeEvaluation
    {
        $this->averageScore = $averageScore;

        return $this;
    }

    /**
     * @return Collection<int, EmployeeScore>
     */
    public function getScores(): Collection
    {
        return $this->scores;
    }

    /**
     * @param Collection<int, EmployeeScore> $scores
     *
     * @return $this
     */
    public function setScores(Collection $scores): static
    {
        $this->scores = $scores;

        return $this;
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

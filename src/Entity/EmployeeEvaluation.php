<?php
declare(strict_types=1);


namespace App\Entity;

use App\Repository\EmployeeEvaluationRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class EmployeeEvaluation
 *
 * @package App\Entity
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
    private DateTimeImmutable $evaluatedAt;

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
    public function getIdentifier(): ?string
    {
        return $this->identifier;
    }

    /**
     * @param string|null $identifier
     * @return EmployeeEvaluation
     */
    public function setIdentifier(?string $identifier): EmployeeEvaluation
    {
        $this->identifier = $identifier;
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
    public function getNote(): ?string
    {
        return $this->note;
    }

    /**
     * @param string|null $note
     * @return EmployeeEvaluation
     */
    public function setNote(?string $note): EmployeeEvaluation
    {
        $this->note = $note;
        return $this;
    }

    /**
     * @return float|null
     */
    public function getAverageScore(): ?float
    {
        return $this->averageScore;
    }

    /**
     * @param float|null $averageScore
     * @return EmployeeEvaluation
     */
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

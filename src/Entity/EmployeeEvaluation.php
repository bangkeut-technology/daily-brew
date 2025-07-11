<?php
declare(strict_types=1);


namespace App\Entity;

use App\Repository\EmployeeEvaluationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class EmployeeEvaluation
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_employee_evaluations')]
#[ORM\Entity(repositoryClass: EmployeeEvaluationRepository::class)]
class EmployeeEvaluation extends AbstractEntity
{
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $employee = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $rater = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?EvaluationTemplate $template = null;

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
     * @return User|null
     */
    public function getEmployee(): ?User
    {
        return $this->employee;
    }

    /**
     * @param User|null $employee
     * @return EmployeeEvaluation
     */
    public function setEmployee(?User $employee): EmployeeEvaluation
    {
        $this->employee = $employee;
        return $this;
    }

    /**
     * @return User|null
     */
    public function getRater(): ?User
    {
        return $this->rater;
    }

    /**
     * @param User|null $rater
     * @return EmployeeEvaluation
     */
    public function setRater(?User $rater): EmployeeEvaluation
    {
        $this->rater = $rater;
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
        if ($this->scores->removeElement($score)) {
            // set the owning side to null (unless already changed)
            if ($score->getEvaluation() === $this) {
                $score->setEvaluation(null);
            }
        }

        return $this;
    }
}

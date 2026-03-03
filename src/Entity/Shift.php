<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\ShiftRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class Shift
 *
 * Represents a named work-time block within a workspace (e.g. "Morning 07–14").
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_shifts')]
#[ORM\Entity(repositoryClass: ShiftRepository::class)]
class Shift extends AbstractEntity
{
    #[ORM\Column(length: 100)]
    private string $name;

    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    /** Grace period (in minutes) before a check-in is marked late. */
    #[ORM\Column(type: 'smallint', options: ['unsigned' => true, 'default' => 0])]
    private int $graceLateMinutes = 0;

    /** Grace period (in minutes) before an early check-out is penalised. */
    #[ORM\Column(type: 'smallint', options: ['unsigned' => true, 'default' => 0])]
    private int $graceEarlyMinutes = 0;

    /**
     * @var Collection<int, ShiftTimeRule>
     */
    #[ORM\OneToMany(targetEntity: ShiftTimeRule::class, mappedBy: 'shift', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $timeRules;

    /**
     * @var Collection<int, Employee>
     */
    #[ORM\OneToMany(targetEntity: Employee::class, mappedBy: 'shift')]
    private Collection $employees;

    public function __construct()
    {
        $this->timeRules = new ArrayCollection();
        $this->employees = new ArrayCollection();
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(?Workspace $workspace): static
    {
        $this->workspace = $workspace;

        return $this;
    }

    public function getGraceLateMinutes(): int
    {
        return $this->graceLateMinutes;
    }

    public function setGraceLateMinutes(int $graceLateMinutes): static
    {
        $this->graceLateMinutes = $graceLateMinutes;

        return $this;
    }

    public function getGraceEarlyMinutes(): int
    {
        return $this->graceEarlyMinutes;
    }

    public function setGraceEarlyMinutes(int $graceEarlyMinutes): static
    {
        $this->graceEarlyMinutes = $graceEarlyMinutes;

        return $this;
    }

    /**
     * @return Collection<int, ShiftTimeRule>
     */
    public function getTimeRules(): Collection
    {
        return $this->timeRules;
    }

    public function addTimeRule(ShiftTimeRule $rule): static
    {
        if (!$this->timeRules->contains($rule)) {
            $this->timeRules->add($rule);
            $rule->setShift($this);
        }

        return $this;
    }

    public function removeTimeRule(ShiftTimeRule $rule): static
    {
        if ($this->timeRules->removeElement($rule) && $rule->getShift() === $this) {
            $rule->setShift(null);
        }

        return $this;
    }

    /**
     * @return Collection<int, Employee>
     */
    public function getEmployees(): Collection
    {
        return $this->employees;
    }

    public function addEmployee(Employee $employee): static
    {
        if (!$this->employees->contains($employee)) {
            $this->employees->add($employee);
            $employee->setShift($this);
        }

        return $this;
    }

    public function removeEmployee(Employee $employee): static
    {
        if ($this->employees->removeElement($employee) && $employee->getShift() === $this) {
            $employee->setShift(null);
        }

        return $this;
    }

    public function __toString(): string
    {
        return $this->name;
    }
}

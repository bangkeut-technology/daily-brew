<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\EmployeeStatus;
use App\Repository\EmployeeRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class Employee.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_employees')]
#[ORM\Entity(repositoryClass: EmployeeRepository::class)]
class Employee extends AbstractEntity
{
    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['employee:read'])]
    private string $firstName;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['employee:read'])]
    private string $lastName;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['employee:read'])]
    private ?string $phoneNumber = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['employee:read'])]
    private ?DateTimeImmutable $dob = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['employee:read'])]
    private ?DateTimeImmutable $joinedAt = null;

    #[ORM\Column(type: 'string', enumType: EmployeeStatus::class)]
    #[Groups(['employee:read'])]
    private EmployeeStatus $status = EmployeeStatus::ACTIVE;

    #[Groups(['employee:read'])]
    public float $averageScore = 0;

    #[ORM\ManyToOne(targetEntity: Store::class, inversedBy: 'employees')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['employee:read'])]
    private ?Store $store = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['employee:read'])]
    private ?User $user = null;

    #[ORM\OneToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $linkedUser = null;

    /**
     * @var Collection<int, Role>
     */
    #[ORM\ManyToMany(targetEntity: Role::class, inversedBy: 'employees')]
    #[ORM\JoinTable(name: 'daily_brew_employee_roles')]
    #[Groups(['employee:read'])]
    private Collection $roles;

    /**
     * @var Collection<int, EvaluationTemplate>
     */
    #[ORM\ManyToMany(targetEntity: EvaluationTemplate::class, inversedBy: 'employees')]
    #[ORM\JoinTable(name: 'daily_brew_employee_templates')]
    #[Groups(['employee:read'])]
    private Collection $templates;

    /**
     * @var Collection<int, Attendance>
     */
    #[ORM\OneToMany(targetEntity: Attendance::class, mappedBy: 'employee', orphanRemoval: true)]
    private Collection $attendances;

    public function __construct()
    {
        $this->roles = new ArrayCollection();
        $this->templates = new ArrayCollection();
        $this->attendances = new ArrayCollection();
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): Employee
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): Employee
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getPhoneNumber(): ?string
    {
        return $this->phoneNumber;
    }

    public function setPhoneNumber(?string $phoneNumber): Employee
    {
        $this->phoneNumber = $phoneNumber;

        return $this;
    }

    public function getDob(): ?DateTimeImmutable
    {
        return $this->dob;
    }

    public function setDob(?DateTimeImmutable $dob): Employee
    {
        $this->dob = $dob;

        return $this;
    }

    public function getJoinedAt(): ?DateTimeImmutable
    {
        return $this->joinedAt;
    }

    public function setJoinedAt(?DateTimeImmutable $joinedAt): Employee
    {
        $this->joinedAt = $joinedAt;

        return $this;
    }

    public function getStatus(): EmployeeStatus
    {
        return $this->status;
    }

    public function setStatus(EmployeeStatus $status): Employee
    {
        $this->status = $status;

        return $this;
    }

    public function getStore(): ?Store
    {
        return $this->store;
    }

    public function setStore(?Store $store): Employee
    {
        $this->store = $store;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): Employee
    {
        $this->user = $user;

        return $this;
    }

    public function getLinkedUser(): ?User
    {
        return $this->linkedUser;
    }

    public function setLinkedUser(?User $linkedUser): Employee
    {
        $this->linkedUser = $linkedUser;

        return $this;
    }

    /**
     * @return Collection<int, EvaluationTemplate>
     */
    public function getTemplates(): Collection
    {
        return $this->templates;
    }

    /**
     * @param Collection<int, EvaluationTemplate> $templates
     *
     * @return Employee
     */
    public function setTemplates(Collection $templates): static
    {
        $this->templates = $templates;

        return $this;
    }

    public function addTemplate(EvaluationTemplate $template): Employee
    {
        if (!$this->templates->contains($template)) {
            $this->templates[] = $template;
            $template->addEmployee($this);
        }

        return $this;
    }

    public function removeTemplate(EvaluationTemplate $template): Employee
    {
        if ($this->templates->removeElement($template)) {
            $template->removeEmployee($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, Role>
     */
    public function getRoles(): Collection
    {
        return $this->roles;
    }

    public function addRole(Role $role): Employee
    {
        if (!$this->roles->contains($role)) {
            $this->roles->add($role);
            $role->addEmployee($this);
        }

        return $this;
    }

    public function removeRole(Role $role): Employee
    {
        if ($this->roles->removeElement($role)) {
            $role->removeEmployee($this);
        }

        return $this;
    }

    /**
     * Returns the full name of the employee.
     */
    public function __toString(): string
    {
        return sprintf('%s %s', $this->firstName, $this->lastName);
    }

    /**
     * @return Collection<int, Attendance>
     */
    public function getAttendances(): Collection
    {
        return $this->attendances;
    }

    public function addAttendance(Attendance $attendance): static
    {
        if (!$this->attendances->contains($attendance)) {
            $this->attendances->add($attendance);
            $attendance->setEmployee($this);
        }

        return $this;
    }

    public function removeAttendance(Attendance $attendance): static
    {
        if ($this->attendances->removeElement($attendance) && $attendance->getEmployee() === $this) {
            $attendance->setEmployee(null);
        }

        return $this;
    }

    /**
     * Get the full name of the employee.
     *
     * @return string
     */
    #[Groups(['employee:read'])]
    public function getFullName(): string
    {
        return sprintf('%s %s', $this->lastName, $this->firstName);
    }
}

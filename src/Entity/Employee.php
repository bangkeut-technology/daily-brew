<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\EmployeeStatusEnum;
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

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    #[ORM\Column(type: 'string', enumType: EmployeeStatusEnum::class)]
    #[Groups(['employee:read'])]
    private EmployeeStatusEnum $status = EmployeeStatusEnum::ACTIVE;

    #[Groups(['employee:read'])]
    public float $averageScore = 0;

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

    /**
     * @var Collection<int, AttendanceBatch>
     */
    #[ORM\ManyToMany(targetEntity: AttendanceBatch::class, mappedBy: 'employees')]
    private Collection $attendanceBatches;

    #[ORM\ManyToOne(inversedBy: 'employees')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    public function __construct()
    {
        $this->attendances = new ArrayCollection();
        $this->attendanceBatches = new ArrayCollection();
        $this->roles = new ArrayCollection();
        $this->templates = new ArrayCollection();
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

    public function getStatus(): EmployeeStatusEnum
    {
        return $this->status;
    }

    public function setStatus(EmployeeStatusEnum $status): Employee
    {
        $this->status = $status;

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

    /**
     * @param Collection<int, Attendance> $attendances
     * @return Employee
     */
    public function setAttendances(Collection $attendances): Employee
    {
        $this->attendances = $attendances;
        return $this;
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
     * @return Collection<int, AttendanceBatch>
     */
    public function getAttendanceBatches(): Collection
    {
        return $this->attendanceBatches;
    }

    /**
     * @param Collection $attendanceBatches
     * @return Employee
     */
    public function setAttendanceBatches(Collection $attendanceBatches): Employee
    {
        $this->attendanceBatches = $attendanceBatches;
        return $this;
    }

    public function addAttendanceBatch(AttendanceBatch $attendanceBatch): Employee
    {
        if (!$this->attendanceBatches->contains($attendanceBatch)) {
            $this->attendanceBatches->add($attendanceBatch);
            $attendanceBatch->addEmployee($this);
        }
        return $this;
    }

    public function removeAttendanceBatch(AttendanceBatch $attendanceBatch): Employee
    {
        if ($this->attendanceBatches->removeElement($attendanceBatch)) {
            $attendanceBatch->removeEmployee($this);
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

    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(?Workspace $workspace): static
    {
        $this->workspace = $workspace;

        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    /**
     * @param DateTimeImmutable|null $deletedAt
     *
     * @return Employee
     */
    public function setDeletedAt(?DateTimeImmutable $deletedAt): Employee
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }
}

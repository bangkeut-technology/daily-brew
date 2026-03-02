<?php
declare(strict_types=1);


namespace App\Entity;

use App\Enum\PlanEnum;
use App\Repository\WorkspaceRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class Workspace
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Entity(repositoryClass: WorkspaceRepository::class)]
#[ORM\Table(name: 'daily_brew_workspaces')]
class Workspace extends AbstractEntity
{
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $name = null;

    #[ORM\Column(enumType: PlanEnum::class)]
    private PlanEnum $plan = PlanEnum::FREE;

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    /**
     * @var Collection<int, WorkspaceUser>
     */
    #[ORM\OneToMany(targetEntity: WorkspaceUser::class, mappedBy: 'workspace')]
    private Collection $users;

    /**
     * @var Collection<int, Employee>
     */
    #[ORM\OneToMany(targetEntity: Employee::class, mappedBy: 'workspace')]
    private Collection $employees;

    /**
     * @var Collection<int, AttendanceBatch>
     */
    #[ORM\OneToMany(targetEntity: AttendanceBatch::class, mappedBy: 'workspace')]
    private Collection $attendanceBatches;

    /**
     * @var Collection<int, Attendance>
     */
    #[ORM\OneToMany(targetEntity: Attendance::class, mappedBy: 'workspace')]
    private Collection $attendances;

    /**
     * @var Collection<int, EvaluationCriteria>
     */
    #[ORM\OneToMany(targetEntity: EvaluationCriteria::class, mappedBy: 'workspace')]
    private Collection $evaluationCriterias;

    /**
     * @var Collection<int, EvaluationTemplate>
     */
    #[ORM\OneToMany(targetEntity: EvaluationTemplate::class, mappedBy: 'workspace')]
    private Collection $evaluationTemplates;

    /**
     * @var Collection<int, EvaluationTemplateCriteria>
     */
    #[ORM\OneToMany(targetEntity: EvaluationTemplateCriteria::class, mappedBy: 'workspace')]
    private Collection $evaluationTemplateCriterias;

    /**
     * @var Collection<int, EmployeeEvaluation>
     */
    #[ORM\OneToMany(targetEntity: EmployeeEvaluation::class, mappedBy: 'workspace')]
    private Collection $employeeEvaluations;

    /**
     * @var Collection<int, WorkspaceAllowedIp>
     */
    #[ORM\OneToMany(targetEntity: WorkspaceAllowedIp::class, mappedBy: 'workspace', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $allowedIps;

    public function __construct()
    {
        $this->users = new ArrayCollection();
        $this->employees = new ArrayCollection();
        $this->allowedIps = new ArrayCollection();
        $this->attendanceBatches = new ArrayCollection();
        $this->attendances = new ArrayCollection();
        $this->evaluationCriterias = new ArrayCollection();
        $this->evaluationTemplates = new ArrayCollection();
        $this->evaluationTemplateCriterias = new ArrayCollection();
        $this->employeeEvaluations = new ArrayCollection();
    }

    /**
     * @return string|null
     */
    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * @param string|null $name
     * @return Workspace
     */
    public function setName(?string $name): Workspace
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return PlanEnum|null
     */
    public function getPlan(): ?PlanEnum
    {
        return $this->plan;
    }

    /**
     * @param PlanEnum|null $plan
     * @return Workspace
     */
    public function setPlan(?PlanEnum $plan): Workspace
    {
        $this->plan = $plan;
        return $this;
    }

    /**
     * @return Collection<int, WorkspaceUser>
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(WorkspaceUser $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->setWorkspace($this);
        }

        return $this;
    }

    public function removeUser(WorkspaceUser $user): static
    {
        if ($this->users->removeElement($user)) {
            // set the owning side to null (unless already changed)
            if ($user->getWorkspace() === $this) {
                $user->setWorkspace(null);
            }
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
            $employee->setWorkspace($this);
        }

        return $this;
    }

    public function removeEmployee(Employee $employee): static
    {
        if ($this->employees->removeElement($employee)) {
            // set the owning side to null (unless already changed)
            if ($employee->getWorkspace() === $this) {
                $employee->setWorkspace(null);
            }
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

    public function addAttendanceBatch(AttendanceBatch $attendanceBatch): static
    {
        if (!$this->attendanceBatches->contains($attendanceBatch)) {
            $this->attendanceBatches->add($attendanceBatch);
            $attendanceBatch->setWorkspace($this);
        }

        return $this;
    }

    public function removeAttendanceBatch(AttendanceBatch $attendanceBatch): static
    {
        if ($this->attendanceBatches->removeElement($attendanceBatch)) {
            // set the owning side to null (unless already changed)
            if ($attendanceBatch->getWorkspace() === $this) {
                $attendanceBatch->setWorkspace(null);
            }
        }

        return $this;
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
            $attendance->setWorkspace($this);
        }

        return $this;
    }

    public function removeAttendance(Attendance $attendance): static
    {
        if ($this->attendances->removeElement($attendance)) {
            // set the owning side to null (unless already changed)
            if ($attendance->getWorkspace() === $this) {
                $attendance->setWorkspace(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, EvaluationCriteria>
     */
    public function getEvaluationCriterias(): Collection
    {
        return $this->evaluationCriterias;
    }

    public function addEvaluationCriteria(EvaluationCriteria $evaluationCriteria): static
    {
        if (!$this->evaluationCriterias->contains($evaluationCriteria)) {
            $this->evaluationCriterias->add($evaluationCriteria);
            $evaluationCriteria->setWorkspace($this);
        }

        return $this;
    }

    public function removeEvaluationCriteria(EvaluationCriteria $evaluationCriteria): static
    {
        if ($this->evaluationCriterias->removeElement($evaluationCriteria)) {
            // set the owning side to null (unless already changed)
            if ($evaluationCriteria->getWorkspace() === $this) {
                $evaluationCriteria->setWorkspace(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, EvaluationTemplate>
     */
    public function getEvaluationTemplates(): Collection
    {
        return $this->evaluationTemplates;
    }

    public function addEvaluationTemplate(EvaluationTemplate $evaluationTemplate): static
    {
        if (!$this->evaluationTemplates->contains($evaluationTemplate)) {
            $this->evaluationTemplates->add($evaluationTemplate);
            $evaluationTemplate->setWorkspace($this);
        }

        return $this;
    }

    public function removeEvaluationTemplate(EvaluationTemplate $evaluationTemplate): static
    {
        if ($this->evaluationTemplates->removeElement($evaluationTemplate)) {
            // set the owning side to null (unless already changed)
            if ($evaluationTemplate->getWorkspace() === $this) {
                $evaluationTemplate->setWorkspace(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, EvaluationTemplateCriteria>
     */
    public function getEvaluationTemplateCriterias(): Collection
    {
        return $this->evaluationTemplateCriterias;
    }

    public function addEvaluationTemplateCriteria(EvaluationTemplateCriteria $evaluationTemplateCriteria): static
    {
        if (!$this->evaluationTemplateCriterias->contains($evaluationTemplateCriteria)) {
            $this->evaluationTemplateCriterias->add($evaluationTemplateCriteria);
            $evaluationTemplateCriteria->setWorkspace($this);
        }

        return $this;
    }

    public function removeEvaluationTemplateCriteria(EvaluationTemplateCriteria $evaluationTemplateCriteria): static
    {
        if ($this->evaluationTemplateCriterias->removeElement($evaluationTemplateCriteria)) {
            // set the owning side to null (unless already changed)
            if ($evaluationTemplateCriteria->getWorkspace() === $this) {
                $evaluationTemplateCriteria->setWorkspace(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, EmployeeEvaluation>
     */
    public function getEmployeeEvaluations(): Collection
    {
        return $this->employeeEvaluations;
    }

    public function addEmployeeEvaluation(EmployeeEvaluation $employeeEvaluation): static
    {
        if (!$this->employeeEvaluations->contains($employeeEvaluation)) {
            $this->employeeEvaluations->add($employeeEvaluation);
            $employeeEvaluation->setWorkspace($this);
        }

        return $this;
    }

    public function removeEmployeeEvaluation(EmployeeEvaluation $employeeEvaluation): static
    {
        if ($this->employeeEvaluations->removeElement($employeeEvaluation)) {
            // set the owning side to null (unless already changed)
            if ($employeeEvaluation->getWorkspace() === $this) {
                $employeeEvaluation->setWorkspace(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, WorkspaceAllowedIp>
     */
    public function getAllowedIps(): Collection
    {
        return $this->allowedIps;
    }

    public function addAllowedIp(WorkspaceAllowedIp $allowedIp): static
    {
        if (!$this->allowedIps->contains($allowedIp)) {
            $this->allowedIps->add($allowedIp);
            $allowedIp->setWorkspace($this);
        }

        return $this;
    }

    public function removeAllowedIp(WorkspaceAllowedIp $allowedIp): static
    {
        if ($this->allowedIps->removeElement($allowedIp)) {
            if ($allowedIp->getWorkspace() === $this) {
                $allowedIp->setWorkspace(null);
            }
        }

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
     * @return Workspace
     */
    public function setDeletedAt(?DateTimeImmutable $deletedAt): Workspace
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }
}

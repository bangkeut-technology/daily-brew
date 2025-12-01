<?php
declare(strict_types=1);


namespace App\Entity;

use App\Enum\PlanEnum;
use App\Repository\AccountRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class Account
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Entity(repositoryClass: AccountRepository::class)]
class Account extends AbstractEntity
{
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $name = null;

    #[ORM\Column(enumType: PlanEnum::class)]
    private ?PlanEnum $plan = null;

    /**
     * @var Collection<int, AccountUser>
     */
    #[ORM\OneToMany(targetEntity: AccountUser::class, mappedBy: 'account')]
    private Collection $users;

    /**
     * @var Collection<int, Store>
     */
    #[ORM\OneToMany(targetEntity: Store::class, mappedBy: 'account')]
    private Collection $stores;

    /**
     * @var Collection<int, Employee>
     */
    #[ORM\OneToMany(targetEntity: Employee::class, mappedBy: 'account')]
    private Collection $employees;

    /**
     * @var Collection<int, AttendanceBatch>
     */
    #[ORM\OneToMany(targetEntity: AttendanceBatch::class, mappedBy: 'account')]
    private Collection $attendanceBatches;

    /**
     * @var Collection<int, Attendance>
     */
    #[ORM\OneToMany(targetEntity: Attendance::class, mappedBy: 'account')]
    private Collection $attendances;

    /**
     * @var Collection<int, EvaluationCriteria>
     */
    #[ORM\OneToMany(targetEntity: EvaluationCriteria::class, mappedBy: 'account')]
    private Collection $evaluationCriterias;

    /**
     * @var Collection<int, EvaluationTemplate>
     */
    #[ORM\OneToMany(targetEntity: EvaluationTemplate::class, mappedBy: 'account')]
    private Collection $evaluationTemplates;

    /**
     * @var Collection<int, EvaluationTemplateCriteria>
     */
    #[ORM\OneToMany(targetEntity: EvaluationTemplateCriteria::class, mappedBy: 'account')]
    private Collection $evaluationTemplateCriterias;

    /**
     * @var Collection<int, EmployeeEvaluation>
     */
    #[ORM\OneToMany(targetEntity: EmployeeEvaluation::class, mappedBy: 'account')]
    private Collection $employeeEvaluations;

    public function __construct()
    {
        $this->users = new ArrayCollection();
        $this->stores = new ArrayCollection();
        $this->employees = new ArrayCollection();
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
     * @return Account
     */
    public function setName(?string $name): Account
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
     * @return Account
     */
    public function setPlan(?PlanEnum $plan): Account
    {
        $this->plan = $plan;
        return $this;
    }

    /**
     * @return Collection<int, AccountUser>
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(AccountUser $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->setAccount($this);
        }

        return $this;
    }

    public function removeUser(AccountUser $user): static
    {
        if ($this->users->removeElement($user)) {
            // set the owning side to null (unless already changed)
            if ($user->getAccount() === $this) {
                $user->setAccount(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Store>
     */
    public function getStores(): Collection
    {
        return $this->stores;
    }

    public function addStore(Store $store): static
    {
        if (!$this->stores->contains($store)) {
            $this->stores->add($store);
            $store->setAccount($this);
        }

        return $this;
    }

    public function removeStore(Store $store): static
    {
        if ($this->stores->removeElement($store)) {
            // set the owning side to null (unless already changed)
            if ($store->getAccount() === $this) {
                $store->setAccount(null);
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
            $employee->setAccount($this);
        }

        return $this;
    }

    public function removeEmployee(Employee $employee): static
    {
        if ($this->employees->removeElement($employee)) {
            // set the owning side to null (unless already changed)
            if ($employee->getAccount() === $this) {
                $employee->setAccount(null);
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
            $attendanceBatch->setAccount($this);
        }

        return $this;
    }

    public function removeAttendanceBatch(AttendanceBatch $attendanceBatch): static
    {
        if ($this->attendanceBatches->removeElement($attendanceBatch)) {
            // set the owning side to null (unless already changed)
            if ($attendanceBatch->getAccount() === $this) {
                $attendanceBatch->setAccount(null);
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
            $attendance->setAccount($this);
        }

        return $this;
    }

    public function removeAttendance(Attendance $attendance): static
    {
        if ($this->attendances->removeElement($attendance)) {
            // set the owning side to null (unless already changed)
            if ($attendance->getAccount() === $this) {
                $attendance->setAccount(null);
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
            $evaluationCriteria->setAccount($this);
        }

        return $this;
    }

    public function removeEvaluationCriteria(EvaluationCriteria $evaluationCriteria): static
    {
        if ($this->evaluationCriterias->removeElement($evaluationCriteria)) {
            // set the owning side to null (unless already changed)
            if ($evaluationCriteria->getAccount() === $this) {
                $evaluationCriteria->setAccount(null);
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
            $evaluationTemplate->setAccount($this);
        }

        return $this;
    }

    public function removeEvaluationTemplate(EvaluationTemplate $evaluationTemplate): static
    {
        if ($this->evaluationTemplates->removeElement($evaluationTemplate)) {
            // set the owning side to null (unless already changed)
            if ($evaluationTemplate->getAccount() === $this) {
                $evaluationTemplate->setAccount(null);
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
            $evaluationTemplateCriteria->setAccount($this);
        }

        return $this;
    }

    public function removeEvaluationTemplateCriteria(EvaluationTemplateCriteria $evaluationTemplateCriteria): static
    {
        if ($this->evaluationTemplateCriterias->removeElement($evaluationTemplateCriteria)) {
            // set the owning side to null (unless already changed)
            if ($evaluationTemplateCriteria->getAccount() === $this) {
                $evaluationTemplateCriteria->setAccount(null);
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
            $employeeEvaluation->setAccount($this);
        }

        return $this;
    }

    public function removeEmployeeEvaluation(EmployeeEvaluation $employeeEvaluation): static
    {
        if ($this->employeeEvaluations->removeElement($employeeEvaluation)) {
            // set the owning side to null (unless already changed)
            if ($employeeEvaluation->getAccount() === $this) {
                $employeeEvaluation->setAccount(null);
            }
        }

        return $this;
    }
}

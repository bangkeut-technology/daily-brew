<?php
declare(strict_types=1);


namespace App\Entity;

use App\Enum\PlanEnum;
use App\Repository\WorkspaceRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Serializer\Attribute\Groups;
use Vich\UploaderBundle\Mapping\Attribute as Vich;

/**
 * Class Workspace
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Entity(repositoryClass: WorkspaceRepository::class)]
#[ORM\Table(name: 'daily_brew_workspaces')]
#[Vich\Uploadable]
class Workspace extends AbstractEntity
{
    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read', 'attendance:read', 'employee:read', 'employee_evaluation:read'])]
    private ?string $name = null;

    #[ORM\Column(enumType: PlanEnum::class)]
    private PlanEnum $plan = PlanEnum::FREE;

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    /**
     * @var File|UploadedFile|null
     */
    #[Vich\UploadableField(
        mapping: 'workspaces',
        fileNameProperty: 'imageName',
        size: 'fileSize',
        mimeType: 'mimeType',
        originalName: 'originalName',
        dimensions: 'dimensions'
    )]
    private UploadedFile|File|null $imageFile = null;

    /**
     * @var string|null
     */
    #[ORM\Column(name: 'image_name', type: Types::STRING, length: 255, nullable: true)]
    private ?string $imageName = null;

    /**
     * @var int|null
     */
    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $fileSize = null;

    /**
     * @var string|null
     */
    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $originalName = null;

    /**
     * @var string|null
     */
    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $mimeType = null;

    /**
     * @var array<int, int>
     */
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $dimensions = null;

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

    /**
     * @return File|UploadedFile|null
     */
    public function getImageFile(): File|UploadedFile|null
    {
        return $this->imageFile;
    }

    /**
     * @param File|UploadedFile|null $imageFile
     *
     * @return Workspace
     */
    public function setImageFile(File|UploadedFile|null $imageFile): static
    {
        $this->imageFile = $imageFile;

        if (null !== $imageFile) {
            $this->updatedAt = new DateTimeImmutable();
        }

        return $this;
    }

    /**
     * @return string|null
     */
    public function getImageName(): ?string
    {
        return $this->imageName;
    }

    /**
     * @param string|null $imageName
     *
     * @return Workspace
     */
    public function setImageName(?string $imageName): Workspace
    {
        $this->imageName = $imageName;
        return $this;
    }

    /**
     * @return int|null
     */
    public function getFileSize(): ?int
    {
        return $this->fileSize;
    }

    /**
     * @param int|null $fileSize
     *
     * @return Workspace
     */
    public function setFileSize(?int $fileSize): Workspace
    {
        $this->fileSize = $fileSize;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getOriginalName(): ?string
    {
        return $this->originalName;
    }

    /**
     * @param string|null $originalName
     *
     * @return Workspace
     */
    public function setOriginalName(?string $originalName): Workspace
    {
        $this->originalName = $originalName;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    /**
     * @param string|null $mimeType
     *
     * @return Workspace
     */
    public function setMimeType(?string $mimeType): Workspace
    {
        $this->mimeType = $mimeType;
        return $this;
    }

    /**
     * @return array|null
     */
    public function getDimensions(): ?array
    {
        return $this->dimensions;
    }

    /**
     * @param array|null $dimensions
     *
     * @return Workspace
     */
    public function setDimensions(?array $dimensions): Workspace
    {
        $this->dimensions = $dimensions;
        return $this;
    }
}

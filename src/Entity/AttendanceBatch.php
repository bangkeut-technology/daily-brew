<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\AttendanceTypeEnum;
use App\Repository\AttendanceBatchRepository;
use App\Util\Canonicalizer;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class AttendanceBatch
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_attendance_batches')]
#[ORM\Entity(repositoryClass: AttendanceBatchRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_ATTENDANCE_BATCH_LABEL', fields: ['label', 'workspace'])]
#[ORM\UniqueConstraint(name: 'UNIQ_ATTENDANCE_BATCH_CANONICAL_LABEL', fields: ['canonicalLabel', 'workspace'])]
#[ORM\HasLifecycleCallbacks]
class AttendanceBatch extends AbstractEntity
{
    #[ORM\Column(enumType: AttendanceTypeEnum::class)]
    #[Groups('attendance_batch:read')]
    private ?AttendanceTypeEnum $type = null;

    #[ORM\Column(length: 255)]
    #[Groups('attendance_batch:read')]
    private ?string $label = null;

    #[ORM\Column(length: 255)]
    #[Groups('attendance_batch:read')]
    private ?string $canonicalLabel = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups('attendance_batch:read')]
    private ?string $note = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups('attendance_batch:read')]
    private ?DateTimeImmutable $fromDate = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups('attendance_batch:read')]
    private ?DateTimeImmutable $toDate = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[Groups('attendance_batch:read')]
    private ?User $user = null;

    /**
     * @var Collection<int, Attendance>
     */
    #[ORM\OneToMany(targetEntity: Attendance::class, mappedBy: 'batch')]
    private Collection $attendances;

    #[ORM\ManyToMany(targetEntity: Employee::class, inversedBy: 'attendanceBatches')]
    #[ORM\JoinTable(name: 'daily_brew_employee_attendance_batches')]
    #[Groups('attendance_batch:read')]
    private Collection $employees;

    #[ORM\ManyToOne(inversedBy: 'attendanceBatches')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    #[ORM\ManyToOne(inversedBy: 'attendanceBatches')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Store $store = null;

    public function __construct()
    {
        $this->attendances = new ArrayCollection();
        $this->employees = new ArrayCollection();
    }

    /**
     * @return AttendanceTypeEnum|null
     */
    public function getType(): ?AttendanceTypeEnum
    {
        return $this->type;
    }

    /**
     * @param AttendanceTypeEnum|null $type
     * @return AttendanceBatch
     */
    public function setType(?AttendanceTypeEnum $type): AttendanceBatch
    {
        $this->type = $type;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getLabel(): ?string
    {
        return $this->label;
    }

    /**
     * @param string|null $label
     * @return AttendanceBatch
     */
    public function setLabel(?string $label): AttendanceBatch
    {
        $this->label = $label;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getCanonicalLabel(): ?string
    {
        return $this->canonicalLabel;
    }

    /**
     * @param string|null $canonicalLabel
     * @return AttendanceBatch
     */
    public function setCanonicalLabel(?string $canonicalLabel): AttendanceBatch
    {
        $this->canonicalLabel = $canonicalLabel;
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
     * @return AttendanceBatch
     */
    public function setNote(?string $note): AttendanceBatch
    {
        $this->note = $note;
        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getFromDate(): ?DateTimeImmutable
    {
        return $this->fromDate;
    }

    /**
     * @param DateTimeImmutable|null $fromDate
     * @return AttendanceBatch
     */
    public function setFromDate(?DateTimeImmutable $fromDate): AttendanceBatch
    {
        $this->fromDate = $fromDate;
        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getToDate(): ?DateTimeImmutable
    {
        return $this->toDate;
    }

    /**
     * @param DateTimeImmutable|null $toDate
     * @return AttendanceBatch
     */
    public function setToDate(?DateTimeImmutable $toDate): AttendanceBatch
    {
        $this->toDate = $toDate;
        return $this;
    }

    /**
     * @return User|null
     */
    public function getUser(): ?User
    {
        return $this->user;
    }

    /**
     * @param User|null $user
     * @return AttendanceBatch
     */
    public function setUser(?User $user): AttendanceBatch
    {
        $this->user = $user;
        return $this;
    }

    public function addAttendance(Attendance $attendance): static
    {
        if (!$this->attendances->contains($attendance)) {
            $this->attendances->add($attendance);
            $attendance->setBatch($this);
        }

        return $this;
    }

    public function removeAttendance(Attendance $attendance): static
    {
        if ($this->attendances->removeElement($attendance) && $attendance->getBatch() === $this) {
            $attendance->setBatch(null);
        }

        return $this;
    }

    /**
     * @return Collection
     */
    public function getAttendances(): Collection
    {
        return $this->attendances;
    }

    /**
     * @param Collection $attendances
     * @return AttendanceBatch
     */
    public function setAttendances(Collection $attendances): AttendanceBatch
    {
        $this->attendances = $attendances;
        return $this;
    }

    /**
     * @return Collection
     */
    public function getEmployees(): Collection
    {
        return $this->employees;
    }

    /**
     * @param Collection $employees
     * @return AttendanceBatch
     */
    public function setEmployees(Collection $employees): AttendanceBatch
    {
        $this->employees = $employees;
        return $this;
    }

    public function addEmployee(Employee $employee): AttendanceBatch
    {
        if (!$this->employees->contains($employee)) {
            $this->employees->add($employee);
            $employee->addAttendanceBatch($this);
        }
        return $this;
    }

    public function removeEmployee(Employee $employee): AttendanceBatch
    {
        if ($this->employees->removeElement($employee)) {
            $employee->removeAttendanceBatch($this);
        }
        return $this;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->getLabel() ?? '';
    }

    /**
     * Canonicalizes the name of the evaluation template.
     * This method should be called before persisting the entity to ensure
     * that the canonical name is set correctly.
     */
    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function canonicalize(): void
    {
        $this->canonicalLabel = Canonicalizer::canonicalize($this->label);
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

    public function getStore(): ?Store
    {
        return $this->store;
    }

    public function setStore(?Store $store): static
    {
        $this->store = $store;

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
     * @return AttendanceBatch
     */
    public function setDeletedAt(?DateTimeImmutable $deletedAt): AttendanceBatch
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }
}

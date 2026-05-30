<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\EmployeeAttendanceTrackingEnum;
use App\Enum\EmployeeRoleEnum;
use App\Enum\EmployeeStatusEnum;
use App\Enum\ManagerPermissionEnum;
use App\Repository\EmployeeRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Attribute as Vich;

/**
 * Class Employee
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_employees')]
#[ORM\UniqueConstraint(name: 'unique_linked_user_workspace', columns: ['linked_user_id', 'workspace_id'])]
#[ORM\Entity(repositoryClass: EmployeeRepository::class)]
#[Vich\Uploadable]
class Employee extends AbstractBaseEntity
{
    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['employee:read'])]
    private string $firstName;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['employee:read'])]
    private string $lastName;

    #[ORM\Column(length: 200, nullable: true)]
    private ?string $nameCanonical = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['employee:read'])]
    private ?string $phoneNumber = null;

    /**
     * Free-text job title — what this person does day to day (Cashier, Cook,
     * Waiter, Barista, etc.). Optional and not validated; the owner picks
     * whatever wording fits their restaurant. Surfaced on the detail header
     * and list rows but not used by any backend logic.
     */
    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['employee:read'])]
    private ?string $jobTitle = null;

    /** Unique username for cross-product staff linking (e.g. BasilBook). */
    #[ORM\Column(length: 50, nullable: true, unique: true)]
    #[Groups(['employee:read'])]
    private ?string $username = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['employee:read'])]
    private ?DateTimeImmutable $dob = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['employee:read'])]
    private ?DateTimeImmutable $joinedAt = null;

    /**
     * When the employee was deactivated (status flipped to INACTIVE). Used so
     * historical attendance/absent rows still surface for days they worked,
     * while dates after this timestamp are excluded. Cleared on re-activation.
     */
    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['employee:read'])]
    private ?DateTimeImmutable $leftAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    #[ORM\Column(type: 'string', enumType: EmployeeStatusEnum::class)]
    #[Groups(['employee:read'])]
    private EmployeeStatusEnum $status = EmployeeStatusEnum::ACTIVE;

    #[ORM\Column(type: 'string', enumType: EmployeeRoleEnum::class, options: ['default' => 'employee'])]
    #[Groups(['employee:read'])]
    private EmployeeRoleEnum $role = EmployeeRoleEnum::EMPLOYEE;

    /**
     * How attendance is tracked for this employee. `Full` is the default — they
     * appear in absent calculations and late/leftEarly flags fire when a shift
     * is assigned. `None` is for staff who shouldn't be counted (admin helpers,
     * staff with no fixed schedule); check-in still records times if they scan.
     */
    #[ORM\Column(type: 'string', length: 20, enumType: EmployeeAttendanceTrackingEnum::class, options: ['default' => 'full'])]
    #[Groups(['employee:read'])]
    private EmployeeAttendanceTrackingEnum $attendanceTracking = EmployeeAttendanceTrackingEnum::Full;

    /**
     * Granular capability flags for managers — only meaningful when role = MANAGER.
     * Stored as JSON array of ManagerPermissionEnum values.
     *
     * @var list<string>
     */
    // No `options['default']` here — MySQL rejects literal defaults on JSON
    // columns under strict mode (it accepts only expression defaults like
    // DEFAULT (JSON_ARRAY())). The PHP-side default `= []` initialises new
    // rows; Version20260510120000 set the SQL DEFAULT (JSON_ARRAY()) on the
    // existing column.
    #[ORM\Column(type: 'json')]
    private array $managerPermissions = [];

    /** The user who created this employee (workspace owner). */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['employee:read'])]
    private ?User $user = null;

    /** Linked user account — allows employee to log in and see their own data. */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['employee:read'])]
    private ?User $linkedUser = null;

    #[ORM\ManyToOne(inversedBy: 'employees')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    #[ORM\ManyToOne(targetEntity: Shift::class, inversedBy: 'employees')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Shift $shift = null;

    /** @var Collection<int, Attendance> */
    #[ORM\OneToMany(targetEntity: Attendance::class, mappedBy: 'employee', orphanRemoval: true)]
    private Collection $attendances;

    /** @var Collection<int, WorkspaceQrCode> */
    #[ORM\ManyToMany(targetEntity: WorkspaceQrCode::class, mappedBy: 'assignedEmployees')]
    private Collection $assignedQrCodes;

    /** @var File|UploadedFile|null */
    #[Vich\UploadableField(
        mapping: 'employees',
        fileNameProperty: 'imageName',
        size: 'fileSize',
        mimeType: 'mimeType',
        originalName: 'originalName',
        dimensions: 'dimensions'
    )]
    private UploadedFile|File|null $imageFile = null;

    #[ORM\Column(name: 'image_name', type: Types::STRING, length: 255, nullable: true)]
    private ?string $imageName = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $fileSize = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $originalName = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $mimeType = null;

    /** @var array<int, int>|null */
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $dimensions = null;

    public function __construct()
    {
        parent::__construct();
        $this->attendances = new ArrayCollection();
        $this->assignedQrCodes = new ArrayCollection();
    }

    // ── Name ───────────────────────────────────────────────────

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;
        return $this;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;
        return $this;
    }

    /** Convenience — used by services/controllers expecting a single name. */
    #[Groups(['employee:read'])]
    public function getName(): string
    {
        return trim($this->firstName . ' ' . $this->lastName);
    }

    #[Groups(['employee:read'])]
    public function getFullName(): string
    {
        return $this->getName();
    }

    public function getNameCanonical(): ?string
    {
        return $this->nameCanonical;
    }

    public function setNameCanonical(?string $nameCanonical): static
    {
        $this->nameCanonical = $nameCanonical;
        return $this;
    }

    // ── Contact / Details ──────────────────────────────────────

    public function getJobTitle(): ?string
    {
        return $this->jobTitle;
    }

    public function setJobTitle(?string $jobTitle): static
    {
        $this->jobTitle = $jobTitle;
        return $this;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(?string $username): static
    {
        $this->username = $username;
        return $this;
    }

    public function getPhoneNumber(): ?string
    {
        return $this->phoneNumber;
    }

    public function setPhoneNumber(?string $phoneNumber): static
    {
        $this->phoneNumber = $phoneNumber;
        return $this;
    }

    public function getDob(): ?DateTimeImmutable
    {
        return $this->dob;
    }

    public function setDob(?DateTimeImmutable $dob): static
    {
        $this->dob = $dob;
        return $this;
    }

    public function getJoinedAt(): ?DateTimeImmutable
    {
        return $this->joinedAt;
    }

    public function setJoinedAt(?DateTimeImmutable $joinedAt): static
    {
        $this->joinedAt = $joinedAt;
        return $this;
    }

    public function getLeftAt(): ?DateTimeImmutable
    {
        return $this->leftAt;
    }

    public function setLeftAt(?DateTimeImmutable $leftAt): static
    {
        $this->leftAt = $leftAt;
        return $this;
    }

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?DateTimeImmutable $deletedAt): static
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    // ── Status ─────────────────────────────────────────────────

    public function getStatus(): EmployeeStatusEnum
    {
        return $this->status;
    }

    public function setStatus(EmployeeStatusEnum $status): static
    {
        $this->status = $status;
        return $this;
    }

    /** Convenience for CheckinService / controllers. */
    public function isActive(): bool
    {
        return $this->status === EmployeeStatusEnum::ACTIVE;
    }

    // ── Role ─────────────────────────────────────────────────

    public function getRole(): EmployeeRoleEnum
    {
        return $this->role;
    }

    public function setRole(EmployeeRoleEnum $role): static
    {
        $this->role = $role;
        return $this;
    }

    public function isManager(): bool
    {
        return $this->role === EmployeeRoleEnum::MANAGER;
    }

    // ── Attendance tracking ──────────────────────────────────

    public function getAttendanceTracking(): EmployeeAttendanceTrackingEnum
    {
        return $this->attendanceTracking;
    }

    public function setAttendanceTracking(EmployeeAttendanceTrackingEnum $mode): static
    {
        $this->attendanceTracking = $mode;
        return $this;
    }

    /** Convenience for DashboardService / CheckinService gates. */
    public function isAttendanceTracked(): bool
    {
        return $this->attendanceTracking === EmployeeAttendanceTrackingEnum::Full;
    }

    // ── Manager permissions ────────────────────────────────────

    /** @return list<ManagerPermissionEnum> */
    public function getManagerPermissions(): array
    {
        return ManagerPermissionEnum::sanitize($this->managerPermissions);
    }

    /** @return list<string> */
    public function getManagerPermissionValues(): array
    {
        return array_map(fn (ManagerPermissionEnum $p) => $p->value, $this->getManagerPermissions());
    }

    /** @param iterable<string|ManagerPermissionEnum> $permissions */
    public function setManagerPermissions(iterable $permissions): static
    {
        $this->managerPermissions = array_map(
            fn (ManagerPermissionEnum $p) => $p->value,
            ManagerPermissionEnum::sanitize($permissions),
        );
        return $this;
    }

    public function hasManagerPermission(ManagerPermissionEnum $permission): bool
    {
        if (!$this->isManager()) {
            return false;
        }
        return in_array($permission->value, $this->managerPermissions, true);
    }

    // ── Relations ──────────────────────────────────────────────

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getLinkedUser(): ?User
    {
        return $this->linkedUser;
    }

    public function setLinkedUser(?User $linkedUser): static
    {
        $this->linkedUser = $linkedUser;
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

    public function getShift(): ?Shift
    {
        return $this->shift;
    }

    public function setShift(?Shift $shift): static
    {
        $this->shift = $shift;
        return $this;
    }

    /** @return Collection<int, Attendance> */
    public function getAttendances(): Collection
    {
        return $this->attendances;
    }

    /** @return Collection<int, WorkspaceQrCode> */
    public function getAssignedQrCodes(): Collection
    {
        return $this->assignedQrCodes;
    }

    // ── Image upload ───────────────────────────────────────────

    public function getImageFile(): File|UploadedFile|null
    {
        return $this->imageFile;
    }

    public function setImageFile(File|UploadedFile|null $imageFile): static
    {
        $this->imageFile = $imageFile;
        // Force the entity to look "dirty" so Doctrine's UPDATE fires even
        // when only the (unmapped) image file changed — matches Workspace.
        if ($imageFile !== null) {
            $this->updatedAt = \App\Service\DateService::now();
        }
        return $this;
    }

    public function getImageName(): ?string
    {
        return $this->imageName;
    }

    public function setImageName(?string $imageName): static
    {
        $this->imageName = $imageName;
        return $this;
    }

    public function getFileSize(): ?int
    {
        return $this->fileSize;
    }

    public function setFileSize(?int $fileSize): static
    {
        $this->fileSize = $fileSize;
        return $this;
    }

    public function getOriginalName(): ?string
    {
        return $this->originalName;
    }

    public function setOriginalName(?string $originalName): static
    {
        $this->originalName = $originalName;
        return $this;
    }

    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    public function setMimeType(?string $mimeType): static
    {
        $this->mimeType = $mimeType;
        return $this;
    }

    public function getDimensions(): ?array
    {
        return $this->dimensions;
    }

    public function setDimensions(?array $dimensions): static
    {
        $this->dimensions = $dimensions;
        return $this;
    }

    public function __toString(): string
    {
        return $this->getName();
    }
}

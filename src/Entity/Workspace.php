<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\WorkspaceRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\UniqueConstraint;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Serializer\Attribute\Groups;
use Vich\UploaderBundle\Mapping\Attribute as Vich;

/**
 * Class Workspace
 *
 * Root aggregate — each workspace represents one restaurant.
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Entity(repositoryClass: WorkspaceRepository::class)]
#[ORM\Table(name: 'daily_brew_workspaces')]
#[UniqueConstraint(name: 'UNIQ_OWNER_WORKSPACE', fields: ['owner', 'name'])]
#[Vich\Uploadable]
class Workspace extends AbstractBaseEntity
{
    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read', 'attendance:read', 'employee:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $nameCanonical = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $owner = null;

    #[ORM\OneToOne(targetEntity: WorkspaceSetting::class, mappedBy: 'workspace', cascade: ['persist', 'remove'])]
    private ?WorkspaceSetting $setting = null;

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    /** @var File|UploadedFile|null */
    #[Vich\UploadableField(
        mapping: 'workspaces',
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

    /** @var Collection<int, Employee> */
    #[ORM\OneToMany(targetEntity: Employee::class, mappedBy: 'workspace')]
    private Collection $employees;

    /** @var Collection<int, Shift> */
    #[ORM\OneToMany(targetEntity: Shift::class, mappedBy: 'workspace')]
    private Collection $shifts;

    /** @var Collection<int, ClosurePeriod> */
    #[ORM\OneToMany(targetEntity: ClosurePeriod::class, mappedBy: 'workspace')]
    private Collection $closurePeriods;

    /** @var Collection<int, Attendance> */
    #[ORM\OneToMany(targetEntity: Attendance::class, mappedBy: 'workspace')]
    private Collection $attendances;

    /** @var Collection<int, LeaveRequest> */
    #[ORM\OneToMany(targetEntity: LeaveRequest::class, mappedBy: 'workspace')]
    private Collection $leaveRequests;

    public function __construct()
    {
        parent::__construct();
        $this->employees = new ArrayCollection();
        $this->shifts = new ArrayCollection();
        $this->closurePeriods = new ArrayCollection();
        $this->attendances = new ArrayCollection();
        $this->leaveRequests = new ArrayCollection();
    }

    // ── Core ───────────────────────────────────────────────────

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): static
    {
        $this->name = $name;
        return $this;
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

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;
        return $this;
    }

    public function getSetting(): ?WorkspaceSetting
    {
        return $this->setting;
    }

    public function setSetting(?WorkspaceSetting $setting): static
    {
        if ($setting !== null && $setting->getWorkspace() !== $this) {
            $setting->setWorkspace($this);
        }
        $this->setting = $setting;
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

    // ── Image ──────────────────────────────────────────────────

    public function getImageFile(): File|UploadedFile|null
    {
        return $this->imageFile;
    }

    public function setImageFile(File|UploadedFile|null $imageFile): static
    {
        $this->imageFile = $imageFile;
        if (null !== $imageFile) {
            $this->updatedAt = new DateTimeImmutable();
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

    // ── Collections ────────────────────────────────────────────

    /** @return Collection<int, Employee> */
    public function getEmployees(): Collection
    {
        return $this->employees;
    }

    /** @return Collection<int, Shift> */
    public function getShifts(): Collection
    {
        return $this->shifts;
    }

    /** @return Collection<int, ClosurePeriod> */
    public function getClosurePeriods(): Collection
    {
        return $this->closurePeriods;
    }

    /** @return Collection<int, Attendance> */
    public function getAttendances(): Collection
    {
        return $this->attendances;
    }

    /** @return Collection<int, LeaveRequest> */
    public function getLeaveRequests(): Collection
    {
        return $this->leaveRequests;
    }
}

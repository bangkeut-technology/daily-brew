<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\WorkspaceQrCodeRepository;
use App\Util\TokenGenerator;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class WorkspaceQrCode
 *
 * Sub-QR code for a workspace (Double Espresso). Employees check in via
 * this QR only when explicitly assigned. Settings inherit from the
 * parent workspace by default but each cluster (IP, geofencing, device
 * verification) can be overridden per QR.
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_workspace_qr_codes')]
#[ORM\Entity(repositoryClass: WorkspaceQrCodeRepository::class)]
class WorkspaceQrCode extends AbstractBaseEntity
{
    #[ORM\ManyToOne(targetEntity: Workspace::class, inversedBy: 'qrCodes')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    /** Unique token encoded in the QR as `dailybrew:wqr:{qrToken}`. */
    #[ORM\Column(length: 24, unique: true)]
    #[Groups(['workspace_qr_code:read'])]
    private string $qrToken;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['workspace_qr_code:read'])]
    private string $name;

    /** Optional manager scoped to this QR — sees attendance/leave for assigned employees only. */
    #[ORM\ManyToOne(targetEntity: Employee::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['workspace_qr_code:read'])]
    private ?Employee $manager = null;

    /** Employees allowed to scan this QR. Owning side. */
    /** @var Collection<int, Employee> */
    #[ORM\ManyToMany(targetEntity: Employee::class, inversedBy: 'assignedQrCodes')]
    #[ORM\JoinTable(name: 'daily_brew_workspace_qr_code_employees')]
    private Collection $assignedEmployees;

    // ── IP restriction (inheritable) ───────────────────────────

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    #[Groups(['workspace_qr_code:read'])]
    private bool $inheritIpSettings = true;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['workspace_qr_code:read'])]
    private bool $ipRestrictionEnabled = false;

    /** @var array<int, string>|null */
    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['workspace_qr_code:read'])]
    private ?array $allowedIps = null;

    // ── Geofencing (inheritable) ───────────────────────────────

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    #[Groups(['workspace_qr_code:read'])]
    private bool $inheritGeofencing = true;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['workspace_qr_code:read'])]
    private bool $geofencingEnabled = false;

    #[ORM\Column(type: 'float', nullable: true)]
    #[Groups(['workspace_qr_code:read'])]
    private ?float $geofencingLatitude = null;

    #[ORM\Column(type: 'float', nullable: true)]
    #[Groups(['workspace_qr_code:read'])]
    private ?float $geofencingLongitude = null;

    #[ORM\Column(type: 'integer', nullable: true, options: ['default' => 100])]
    #[Groups(['workspace_qr_code:read'])]
    private ?int $geofencingRadiusMeters = 100;

    // ── Device verification (inheritable) ──────────────────────

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    #[Groups(['workspace_qr_code:read'])]
    private bool $inheritDeviceVerification = true;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['workspace_qr_code:read'])]
    private bool $deviceVerificationEnabled = false;

    public function __construct()
    {
        parent::__construct();
        $this->qrToken = TokenGenerator::generatePublicId(20);
        $this->assignedEmployees = new ArrayCollection();
    }

    // ── Workspace ──────────────────────────────────────────────

    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(?Workspace $workspace): static
    {
        $this->workspace = $workspace;
        return $this;
    }

    // ── Token / Name ───────────────────────────────────────────

    public function getQrToken(): string
    {
        return $this->qrToken;
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

    // ── Manager ────────────────────────────────────────────────

    public function getManager(): ?Employee
    {
        return $this->manager;
    }

    public function setManager(?Employee $manager): static
    {
        $this->manager = $manager;
        return $this;
    }

    // ── Assigned employees ─────────────────────────────────────

    /** @return Collection<int, Employee> */
    public function getAssignedEmployees(): Collection
    {
        return $this->assignedEmployees;
    }

    public function addAssignedEmployee(Employee $employee): static
    {
        if (!$this->assignedEmployees->contains($employee)) {
            $this->assignedEmployees->add($employee);
        }
        return $this;
    }

    public function removeAssignedEmployee(Employee $employee): static
    {
        $this->assignedEmployees->removeElement($employee);
        return $this;
    }

    public function hasAssignedEmployee(Employee $employee): bool
    {
        return $this->assignedEmployees->contains($employee);
    }

    // ── IP settings ────────────────────────────────────────────

    public function isInheritIpSettings(): bool
    {
        return $this->inheritIpSettings;
    }

    public function setInheritIpSettings(bool $inheritIpSettings): static
    {
        $this->inheritIpSettings = $inheritIpSettings;
        return $this;
    }

    public function isIpRestrictionEnabled(): bool
    {
        return $this->ipRestrictionEnabled;
    }

    public function setIpRestrictionEnabled(bool $ipRestrictionEnabled): static
    {
        $this->ipRestrictionEnabled = $ipRestrictionEnabled;
        return $this;
    }

    /** @return array<int, string>|null */
    public function getAllowedIps(): ?array
    {
        return $this->allowedIps;
    }

    /** @param array<int, string>|null $allowedIps */
    public function setAllowedIps(?array $allowedIps): static
    {
        $this->allowedIps = $allowedIps;
        return $this;
    }

    // ── Geofencing ─────────────────────────────────────────────

    public function isInheritGeofencing(): bool
    {
        return $this->inheritGeofencing;
    }

    public function setInheritGeofencing(bool $inheritGeofencing): static
    {
        $this->inheritGeofencing = $inheritGeofencing;
        return $this;
    }

    public function isGeofencingEnabled(): bool
    {
        return $this->geofencingEnabled;
    }

    public function setGeofencingEnabled(bool $geofencingEnabled): static
    {
        $this->geofencingEnabled = $geofencingEnabled;
        return $this;
    }

    public function getGeofencingLatitude(): ?float
    {
        return $this->geofencingLatitude;
    }

    public function setGeofencingLatitude(?float $geofencingLatitude): static
    {
        $this->geofencingLatitude = $geofencingLatitude;
        return $this;
    }

    public function getGeofencingLongitude(): ?float
    {
        return $this->geofencingLongitude;
    }

    public function setGeofencingLongitude(?float $geofencingLongitude): static
    {
        $this->geofencingLongitude = $geofencingLongitude;
        return $this;
    }

    public function getGeofencingRadiusMeters(): ?int
    {
        return $this->geofencingRadiusMeters;
    }

    public function setGeofencingRadiusMeters(?int $geofencingRadiusMeters): static
    {
        $this->geofencingRadiusMeters = $geofencingRadiusMeters;
        return $this;
    }

    // ── Device verification ────────────────────────────────────

    public function isInheritDeviceVerification(): bool
    {
        return $this->inheritDeviceVerification;
    }

    public function setInheritDeviceVerification(bool $inheritDeviceVerification): static
    {
        $this->inheritDeviceVerification = $inheritDeviceVerification;
        return $this;
    }

    public function isDeviceVerificationEnabled(): bool
    {
        return $this->deviceVerificationEnabled;
    }

    public function setDeviceVerificationEnabled(bool $deviceVerificationEnabled): static
    {
        $this->deviceVerificationEnabled = $deviceVerificationEnabled;
        return $this;
    }
}

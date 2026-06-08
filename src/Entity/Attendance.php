<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\AttendanceRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class Attendance
 *
 * One record per employee per day. Tracks check-in/out, late, early departure.
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_attendances')]
#[ORM\Entity(repositoryClass: AttendanceRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_ATTENDANCE_EMPLOYEE_DATE', fields: ['employee', 'date'])]
class Attendance extends AbstractBaseEntity
{
    #[ORM\Column(type: 'date_immutable')]
    #[Groups(['attendance:read'])]
    private ?DateTimeImmutable $date = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['attendance:read'])]
    private ?DateTimeImmutable $checkInAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['attendance:read'])]
    private ?DateTimeImmutable $checkOutAt = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['attendance:read'])]
    private bool $isLate = false;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['attendance:read'])]
    private bool $leftEarly = false;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $checkInLat = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $checkInLng = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $checkOutLat = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $checkOutLng = null;

    #[ORM\Column(length: 45, nullable: true)]
    private ?string $ipAddress = null;

    #[ORM\Column(length: 36, nullable: true)]
    private ?string $checkInDeviceId = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $checkInDeviceName = null;

    #[ORM\Column(length: 36, nullable: true)]
    private ?string $checkOutDeviceId = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $checkOutDeviceName = null;

    #[ORM\ManyToOne(targetEntity: Employee::class, inversedBy: 'attendances')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['attendance:read'])]
    private ?Employee $employee = null;

    #[ORM\ManyToOne(targetEntity: Workspace::class, inversedBy: 'attendances')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    #[Groups(['attendance:read'])]
    private ?Workspace $workspace = null;

    /** Sub-QR used for check-in (null = main workspace QR). */
    #[ORM\ManyToOne(targetEntity: WorkspaceQrCode::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['attendance:read'])]
    private ?WorkspaceQrCode $qrCode = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['attendance:read'])]
    private ?DateTimeImmutable $editedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $editedBy = null;

    #[ORM\Column(length: 180, nullable: true)]
    #[Groups(['attendance:read'])]
    private ?string $editedByEmail = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['attendance:read'])]
    private ?string $editReason = null;

    /** Original scan time captured on first manager edit. Never overwritten on subsequent edits. */
    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['attendance:read'])]
    private ?DateTimeImmutable $originalCheckInAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['attendance:read'])]
    private ?DateTimeImmutable $originalCheckOutAt = null;

    /**
     * Soft-void audit — populated when an owner/manager deletes the row via the
     * void endpoint. The row stays in place (preserving the unique
     * (employee, date) slot and the historical check-in/out times) but is
     * excluded from stats and grayed-out in lists. A subsequent QR check-in or
     * manual create on the same day resurrects the row (clears these fields).
     */
    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['attendance:read'])]
    private ?DateTimeImmutable $voidedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $voidedBy = null;

    #[ORM\Column(length: 180, nullable: true)]
    #[Groups(['attendance:read'])]
    private ?string $voidedByEmail = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['attendance:read'])]
    private ?string $voidReason = null;

    // ── Date ───────────────────────────────────────────────────

    public function getDate(): ?DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(?DateTimeImmutable $date): static
    {
        $this->date = $date;
        return $this;
    }

    // ── Check-in / Check-out ───────────────────────────────────

    public function getCheckInAt(): ?DateTimeImmutable
    {
        return $this->checkInAt;
    }

    public function setCheckInAt(?DateTimeImmutable $checkInAt): static
    {
        $this->checkInAt = $checkInAt;
        return $this;
    }

    public function getCheckOutAt(): ?DateTimeImmutable
    {
        return $this->checkOutAt;
    }

    public function setCheckOutAt(?DateTimeImmutable $checkOutAt): static
    {
        $this->checkOutAt = $checkOutAt;
        return $this;
    }

    // ── Geolocation ──────────────────────────────────────────────

    public function getCheckInLat(): ?float { return $this->checkInLat; }
    public function setCheckInLat(?float $v): static { $this->checkInLat = $v; return $this; }

    public function getCheckInLng(): ?float { return $this->checkInLng; }
    public function setCheckInLng(?float $v): static { $this->checkInLng = $v; return $this; }

    public function getCheckOutLat(): ?float { return $this->checkOutLat; }
    public function setCheckOutLat(?float $v): static { $this->checkOutLat = $v; return $this; }

    public function getCheckOutLng(): ?float { return $this->checkOutLng; }
    public function setCheckOutLng(?float $v): static { $this->checkOutLng = $v; return $this; }

    // ── Flags ──────────────────────────────────────────────────

    public function isLate(): bool
    {
        return $this->isLate;
    }

    public function setIsLate(bool $isLate): static
    {
        $this->isLate = $isLate;
        return $this;
    }

    public function hasLeftEarly(): bool
    {
        return $this->leftEarly;
    }

    public function setLeftEarly(bool $leftEarly): static
    {
        $this->leftEarly = $leftEarly;
        return $this;
    }

    // ── IP address ─────────────────────────────────────────────

    public function getIpAddress(): ?string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(?string $ipAddress): static
    {
        $this->ipAddress = $ipAddress;
        return $this;
    }

    // ── Device ─────────────────────────────────────────────────

    public function getCheckInDeviceId(): ?string { return $this->checkInDeviceId; }
    public function setCheckInDeviceId(?string $v): static { $this->checkInDeviceId = $v; return $this; }

    public function getCheckInDeviceName(): ?string { return $this->checkInDeviceName; }
    public function setCheckInDeviceName(?string $v): static { $this->checkInDeviceName = $v; return $this; }

    public function getCheckOutDeviceId(): ?string { return $this->checkOutDeviceId; }
    public function setCheckOutDeviceId(?string $v): static { $this->checkOutDeviceId = $v; return $this; }

    public function getCheckOutDeviceName(): ?string { return $this->checkOutDeviceName; }
    public function setCheckOutDeviceName(?string $v): static { $this->checkOutDeviceName = $v; return $this; }

    // ── Relations ──────────────────────────────────────────────

    public function getEmployee(): ?Employee
    {
        return $this->employee;
    }

    public function setEmployee(?Employee $employee): static
    {
        $this->employee = $employee;
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

    public function getQrCode(): ?WorkspaceQrCode
    {
        return $this->qrCode;
    }

    public function setQrCode(?WorkspaceQrCode $qrCode): static
    {
        $this->qrCode = $qrCode;
        return $this;
    }

    // ── Edit audit ─────────────────────────────────────────────

    public function getEditedAt(): ?DateTimeImmutable { return $this->editedAt; }
    public function setEditedAt(?DateTimeImmutable $v): static { $this->editedAt = $v; return $this; }

    public function getEditedBy(): ?User { return $this->editedBy; }
    public function setEditedBy(?User $v): static { $this->editedBy = $v; return $this; }

    public function getEditedByEmail(): ?string { return $this->editedByEmail; }
    public function setEditedByEmail(?string $v): static { $this->editedByEmail = $v; return $this; }

    public function getEditReason(): ?string { return $this->editReason; }
    public function setEditReason(?string $v): static { $this->editReason = $v; return $this; }

    public function getOriginalCheckInAt(): ?DateTimeImmutable { return $this->originalCheckInAt; }
    public function setOriginalCheckInAt(?DateTimeImmutable $v): static { $this->originalCheckInAt = $v; return $this; }

    public function getOriginalCheckOutAt(): ?DateTimeImmutable { return $this->originalCheckOutAt; }
    public function setOriginalCheckOutAt(?DateTimeImmutable $v): static { $this->originalCheckOutAt = $v; return $this; }

    public function isEdited(): bool
    {
        return $this->editedAt !== null;
    }

    // ── Void audit ─────────────────────────────────────────────

    public function getVoidedAt(): ?DateTimeImmutable { return $this->voidedAt; }
    public function setVoidedAt(?DateTimeImmutable $v): static { $this->voidedAt = $v; return $this; }

    public function getVoidedBy(): ?User { return $this->voidedBy; }
    public function setVoidedBy(?User $v): static { $this->voidedBy = $v; return $this; }

    public function getVoidedByEmail(): ?string { return $this->voidedByEmail; }
    public function setVoidedByEmail(?string $v): static { $this->voidedByEmail = $v; return $this; }

    public function getVoidReason(): ?string { return $this->voidReason; }
    public function setVoidReason(?string $v): static { $this->voidReason = $v; return $this; }

    public function isVoided(): bool
    {
        return $this->voidedAt !== null;
    }

    /** Clear void audit — used when a voided day is resurrected by a new check-in or manual entry. */
    public function clearVoid(): static
    {
        $this->voidedAt = null;
        $this->voidedBy = null;
        $this->voidedByEmail = null;
        $this->voidReason = null;
        return $this;
    }
}

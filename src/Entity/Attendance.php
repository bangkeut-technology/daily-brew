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

    #[ORM\Column(length: 45, nullable: true)]
    private ?string $ipAddress = null;

    #[ORM\ManyToOne(targetEntity: Employee::class, inversedBy: 'attendances')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['attendance:read'])]
    private ?Employee $employee = null;

    #[ORM\ManyToOne(targetEntity: Workspace::class, inversedBy: 'attendances')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    #[Groups(['attendance:read'])]
    private ?Workspace $workspace = null;

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
}

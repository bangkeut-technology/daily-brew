<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\WorkspaceSettingRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class WorkspaceSetting
 *
 * OneToOne typed settings per workspace — IP restriction, geofencing, timezone.
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_workspace_settings')]
#[ORM\Entity(repositoryClass: WorkspaceSettingRepository::class)]
class WorkspaceSetting extends AbstractBaseEntity
{
    #[ORM\OneToOne(targetEntity: Workspace::class, inversedBy: 'setting')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $ipRestrictionEnabled = false;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $allowedIps = null;

    #[ORM\Column(length: 50, options: ['default' => 'Asia/Phnom_Penh'])]
    private string $timezone = 'Asia/Phnom_Penh';

    /** Date display format: DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD */
    #[ORM\Column(length: 12, options: ['default' => 'DD/MM/YYYY'])]
    private string $dateFormat = 'DD/MM/YYYY';

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $deviceVerificationEnabled = false;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $geofencingEnabled = false;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $geofencingLatitude = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $geofencingLongitude = null;

    #[ORM\Column(type: 'integer', nullable: true, options: ['default' => 100])]
    private ?int $geofencingRadiusMeters = 100;

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

    // ── IP restriction ─────────────────────────────────────────

    public function isIpRestrictionEnabled(): bool
    {
        return $this->ipRestrictionEnabled;
    }

    public function setIpRestrictionEnabled(bool $ipRestrictionEnabled): static
    {
        $this->ipRestrictionEnabled = $ipRestrictionEnabled;
        return $this;
    }

    public function getAllowedIps(): ?array
    {
        return $this->allowedIps;
    }

    public function setAllowedIps(?array $allowedIps): static
    {
        $this->allowedIps = $allowedIps;
        return $this;
    }

    // ── Timezone ───────────────────────────────────────────────

    public function getTimezone(): string
    {
        return $this->timezone;
    }

    public function setTimezone(string $timezone): static
    {
        $this->timezone = $timezone;
        return $this;
    }

    public function getDateFormat(): string
    {
        return $this->dateFormat;
    }

    public function setDateFormat(string $dateFormat): static
    {
        $this->dateFormat = $dateFormat;
        return $this;
    }

    // ── Device verification ──────────────────────────────────────

    public function isDeviceVerificationEnabled(): bool
    {
        return $this->deviceVerificationEnabled;
    }

    public function setDeviceVerificationEnabled(bool $deviceVerificationEnabled): static
    {
        $this->deviceVerificationEnabled = $deviceVerificationEnabled;
        return $this;
    }

    // ── Geofencing ─────────────────────────────────────────────

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
}

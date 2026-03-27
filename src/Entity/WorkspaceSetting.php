<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\WorkspaceSettingRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class WorkspaceSetting
 *
 * OneToOne typed settings per workspace — IP restriction, geofencing, locale.
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

    #[ORM\Column(length: 5, options: ['default' => 'en'])]
    private string $locale = 'en';

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

    // ── Locale / Timezone ──────────────────────────────────────

    public function getTimezone(): string
    {
        return $this->timezone;
    }

    public function setTimezone(string $timezone): static
    {
        $this->timezone = $timezone;
        return $this;
    }

    public function getLocale(): string
    {
        return $this->locale;
    }

    public function setLocale(string $locale): static
    {
        $this->locale = $locale;
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

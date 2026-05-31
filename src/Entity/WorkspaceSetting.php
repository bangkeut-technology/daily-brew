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

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $telegramNotificationsEnabled = false;

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $telegramChatId = null;

    /**
     * Per-check-in Telegram alert toggle. Off by default — even with Telegram
     * enabled, owners shouldn't get a ping for every staff punch unless they
     * explicitly opt in (a 5-person café = 10+ pings/day). When on, every
     * employee check-in/out fires a Telegram message to the owner's personal
     * chat and the workspace group (if configured). Espresso+ feature, gated
     * server-side via PlanService::canUseTelegramNotifications.
     */
    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $telegramCheckinAlertsEnabled = false;

    /**
     * Per-check-in Expo push alert toggle. Same semantics as
     * `telegramCheckinAlertsEnabled` but delivered to the owner's logged-in
     * mobile devices instead of Telegram. Off by default and Espresso-gated
     * (same plan check as Telegram alerts) — a busy café would flood the
     * owner with one push per punch otherwise.
     */
    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $pushCheckinAlertsEnabled = false;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $tapCheckinEnabled = false;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $nfcCheckinEnabled = false;

    /**
     * Minimum minutes between successive NFC scans by the same employee.
     * 0 disables the cooldown entirely. Defaults to 15 — matches the typical
     * "I tapped the tag and the phone vibrated, did it work?" panic window
     * without blocking a real check-out at the end of a short shift.
     */
    #[ORM\Column(type: 'integer', options: ['default' => 15])]
    private int $nfcCheckinIntervalMinutes = 15;

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

    // ── Telegram ──────────────────────────────────────────────

    public function isTelegramNotificationsEnabled(): bool
    {
        return $this->telegramNotificationsEnabled;
    }

    public function setTelegramNotificationsEnabled(bool $telegramNotificationsEnabled): static
    {
        $this->telegramNotificationsEnabled = $telegramNotificationsEnabled;
        return $this;
    }

    public function getTelegramChatId(): ?string
    {
        return $this->telegramChatId;
    }

    public function setTelegramChatId(?string $telegramChatId): static
    {
        $this->telegramChatId = $telegramChatId;
        return $this;
    }

    public function isTelegramCheckinAlertsEnabled(): bool
    {
        return $this->telegramCheckinAlertsEnabled;
    }

    public function setTelegramCheckinAlertsEnabled(bool $telegramCheckinAlertsEnabled): static
    {
        $this->telegramCheckinAlertsEnabled = $telegramCheckinAlertsEnabled;
        return $this;
    }

    public function isPushCheckinAlertsEnabled(): bool
    {
        return $this->pushCheckinAlertsEnabled;
    }

    public function setPushCheckinAlertsEnabled(bool $pushCheckinAlertsEnabled): static
    {
        $this->pushCheckinAlertsEnabled = $pushCheckinAlertsEnabled;
        return $this;
    }

    // ── Tap check-in ──────────────────────────────────────────

    public function isTapCheckinEnabled(): bool
    {
        return $this->tapCheckinEnabled;
    }

    public function setTapCheckinEnabled(bool $tapCheckinEnabled): static
    {
        $this->tapCheckinEnabled = $tapCheckinEnabled;
        return $this;
    }

    // ── NFC check-in ──────────────────────────────────────────

    public function isNfcCheckinEnabled(): bool
    {
        return $this->nfcCheckinEnabled;
    }

    public function setNfcCheckinEnabled(bool $nfcCheckinEnabled): static
    {
        $this->nfcCheckinEnabled = $nfcCheckinEnabled;
        return $this;
    }

    public function getNfcCheckinIntervalMinutes(): int
    {
        return $this->nfcCheckinIntervalMinutes;
    }

    /**
     * Clamp to 0–120 minutes. 0 disables the cooldown; the upper bound keeps
     * a typo from locking the team out for a whole day. Values outside the
     * range are clamped rather than thrown — the settings UI is plain
     * `<input type="number" min="0" max="120">` and we'd rather quietly
     * accept the closest valid value than surface a 500.
     */
    public function setNfcCheckinIntervalMinutes(int $nfcCheckinIntervalMinutes): static
    {
        $this->nfcCheckinIntervalMinutes = max(0, min(120, $nfcCheckinIntervalMinutes));
        return $this;
    }
}

<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\MobileAppConfigRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Singleton row holding the iOS / Android identifiers needed to serve the
 * `.well-known/apple-app-site-association` and `.well-known/assetlinks.json`
 * files. Edited by super-admins under /admin/mobile-app-config so we don't
 * have to redeploy when the signing cert rotates.
 */
#[ORM\Table(name: 'daily_brew_mobile_app_config')]
#[ORM\Entity(repositoryClass: MobileAppConfigRepository::class)]
class MobileAppConfig extends AbstractBaseEntity
{
    /** 10-character Apple Team ID (Apple Developer → Membership). */
    #[ORM\Column(length: 32, nullable: true)]
    private ?string $iosTeamId = null;

    /** iOS bundle identifier (e.g. work.dailybrew.mobile). */
    #[ORM\Column(length: 191, nullable: true)]
    private ?string $iosBundleId = null;

    /** Android application id (e.g. work.dailybrew.mobile). */
    #[ORM\Column(length: 191, nullable: true)]
    private ?string $androidPackage = null;

    /**
     * Android signing cert SHA-256 fingerprints (Play App Signing key), one
     * per build variant, in `AB:CD:EF:…` format. Stored as JSON array.
     */
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $androidSha256Fingerprints = null;

    public function getIosTeamId(): ?string
    {
        return $this->iosTeamId;
    }

    public function setIosTeamId(?string $iosTeamId): static
    {
        $this->iosTeamId = $iosTeamId;
        return $this;
    }

    public function getIosBundleId(): ?string
    {
        return $this->iosBundleId;
    }

    public function setIosBundleId(?string $iosBundleId): static
    {
        $this->iosBundleId = $iosBundleId;
        return $this;
    }

    public function getAndroidPackage(): ?string
    {
        return $this->androidPackage;
    }

    public function setAndroidPackage(?string $androidPackage): static
    {
        $this->androidPackage = $androidPackage;
        return $this;
    }

    /** @return list<string>|null */
    public function getAndroidSha256Fingerprints(): ?array
    {
        return $this->androidSha256Fingerprints;
    }

    /** @param list<string>|null $fingerprints */
    public function setAndroidSha256Fingerprints(?array $fingerprints): static
    {
        $this->androidSha256Fingerprints = $fingerprints;
        return $this;
    }

    public function isIosConfigured(): bool
    {
        return $this->iosTeamId !== null && $this->iosTeamId !== ''
            && $this->iosBundleId !== null && $this->iosBundleId !== '';
    }

    public function isAndroidConfigured(): bool
    {
        return $this->androidPackage !== null && $this->androidPackage !== ''
            && !empty($this->androidSha256Fingerprints);
    }
}

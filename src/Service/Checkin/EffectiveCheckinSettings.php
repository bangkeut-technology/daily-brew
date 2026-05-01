<?php

declare(strict_types=1);

namespace App\Service\Checkin;

use App\Entity\Workspace;
use App\Entity\WorkspaceQrCode;
use App\Entity\WorkspaceSetting;

/**
 * Resolved IP / geofence / device verification settings for a check-in.
 *
 * Built from a Workspace (main QR) or a WorkspaceQrCode (sub QR). For
 * sub-QRs, each setting cluster either inherits from the parent
 * workspace or uses the QR's own override values.
 *
 * Timezone always comes from the workspace — sub-QRs do not override it.
 */
final class EffectiveCheckinSettings
{
    /** @param array<int, string>|null $allowedIps */
    public function __construct(
        public readonly string $timezone,
        public readonly bool $ipRestrictionEnabled,
        public readonly ?array $allowedIps,
        public readonly bool $geofencingEnabled,
        public readonly ?float $geofencingLatitude,
        public readonly ?float $geofencingLongitude,
        public readonly ?int $geofencingRadiusMeters,
        public readonly bool $deviceVerificationEnabled,
    ) {}

    public static function fromWorkspace(Workspace $workspace): self
    {
        $setting = $workspace->getSetting();

        return new self(
            timezone: $setting?->getTimezone() ?? 'UTC',
            ipRestrictionEnabled: $setting?->isIpRestrictionEnabled() ?? false,
            allowedIps: $setting?->getAllowedIps(),
            geofencingEnabled: $setting?->isGeofencingEnabled() ?? false,
            geofencingLatitude: $setting?->getGeofencingLatitude(),
            geofencingLongitude: $setting?->getGeofencingLongitude(),
            geofencingRadiusMeters: $setting?->getGeofencingRadiusMeters(),
            deviceVerificationEnabled: $setting?->isDeviceVerificationEnabled() ?? false,
        );
    }

    public static function fromQrCode(WorkspaceQrCode $qrCode): self
    {
        $workspace = $qrCode->getWorkspace();
        $wsSetting = $workspace?->getSetting();

        [$ipEnabled, $allowedIps] = self::resolveIp($qrCode, $wsSetting);
        [$geoEnabled, $geoLat, $geoLng, $geoRadius] = self::resolveGeofence($qrCode, $wsSetting);
        $deviceEnabled = self::resolveDeviceVerification($qrCode, $wsSetting);

        return new self(
            timezone: $wsSetting?->getTimezone() ?? 'UTC',
            ipRestrictionEnabled: $ipEnabled,
            allowedIps: $allowedIps,
            geofencingEnabled: $geoEnabled,
            geofencingLatitude: $geoLat,
            geofencingLongitude: $geoLng,
            geofencingRadiusMeters: $geoRadius,
            deviceVerificationEnabled: $deviceEnabled,
        );
    }

    /**
     * @return array{0: bool, 1: array<int, string>|null}
     */
    private static function resolveIp(WorkspaceQrCode $qr, ?WorkspaceSetting $ws): array
    {
        if ($qr->isInheritIpSettings()) {
            return [
                $ws?->isIpRestrictionEnabled() ?? false,
                $ws?->getAllowedIps(),
            ];
        }

        return [$qr->isIpRestrictionEnabled(), $qr->getAllowedIps()];
    }

    /**
     * @return array{0: bool, 1: ?float, 2: ?float, 3: ?int}
     */
    private static function resolveGeofence(WorkspaceQrCode $qr, ?WorkspaceSetting $ws): array
    {
        if ($qr->isInheritGeofencing()) {
            return [
                $ws?->isGeofencingEnabled() ?? false,
                $ws?->getGeofencingLatitude(),
                $ws?->getGeofencingLongitude(),
                $ws?->getGeofencingRadiusMeters(),
            ];
        }

        return [
            $qr->isGeofencingEnabled(),
            $qr->getGeofencingLatitude(),
            $qr->getGeofencingLongitude(),
            $qr->getGeofencingRadiusMeters(),
        ];
    }

    private static function resolveDeviceVerification(WorkspaceQrCode $qr, ?WorkspaceSetting $ws): bool
    {
        if ($qr->isInheritDeviceVerification()) {
            return $ws?->isDeviceVerificationEnabled() ?? false;
        }

        return $qr->isDeviceVerificationEnabled();
    }
}

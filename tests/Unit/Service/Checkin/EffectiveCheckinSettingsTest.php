<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Checkin;

use App\Entity\Workspace;
use App\Entity\WorkspaceQrCode;
use App\Entity\WorkspaceSetting;
use App\Service\Checkin\EffectiveCheckinSettings;
use PHPUnit\Framework\TestCase;

class EffectiveCheckinSettingsTest extends TestCase
{
    public function testFromWorkspaceFallsBackToDefaultsWhenSettingMissing(): void
    {
        $workspace = new Workspace();

        $effective = EffectiveCheckinSettings::fromWorkspace($workspace);

        $this->assertSame('UTC', $effective->timezone);
        $this->assertFalse($effective->ipRestrictionEnabled);
        $this->assertNull($effective->allowedIps);
        $this->assertFalse($effective->geofencingEnabled);
        $this->assertNull($effective->geofencingLatitude);
        $this->assertNull($effective->geofencingLongitude);
        $this->assertNull($effective->geofencingRadiusMeters);
        $this->assertFalse($effective->deviceVerificationEnabled);
    }

    public function testFromWorkspaceReadsAllFieldsFromSetting(): void
    {
        $workspace = new Workspace();
        $setting = (new WorkspaceSetting())
            ->setTimezone('Asia/Phnom_Penh')
            ->setIpRestrictionEnabled(true)
            ->setAllowedIps(['1.2.3.4'])
            ->setGeofencingEnabled(true)
            ->setGeofencingLatitude(11.55)
            ->setGeofencingLongitude(104.9)
            ->setGeofencingRadiusMeters(50)
            ->setDeviceVerificationEnabled(true);
        $workspace->setSetting($setting);

        $effective = EffectiveCheckinSettings::fromWorkspace($workspace);

        $this->assertSame('Asia/Phnom_Penh', $effective->timezone);
        $this->assertTrue($effective->ipRestrictionEnabled);
        $this->assertSame(['1.2.3.4'], $effective->allowedIps);
        $this->assertTrue($effective->geofencingEnabled);
        $this->assertSame(11.55, $effective->geofencingLatitude);
        $this->assertSame(104.9, $effective->geofencingLongitude);
        $this->assertSame(50, $effective->geofencingRadiusMeters);
        $this->assertTrue($effective->deviceVerificationEnabled);
    }

    public function testFromQrCodeInheritsAllClustersWhenFlagsTrue(): void
    {
        $workspace = $this->workspaceWithRichSetting();
        $qr = (new WorkspaceQrCode())
            ->setWorkspace($workspace)
            ->setInheritIpSettings(true)
            ->setInheritGeofencing(true)
            ->setInheritDeviceVerification(true)
            // QR-side overrides should be ignored when inherit flags are true.
            ->setIpRestrictionEnabled(false)
            ->setAllowedIps(['9.9.9.9'])
            ->setGeofencingEnabled(false)
            ->setGeofencingLatitude(0.0)
            ->setGeofencingLongitude(0.0)
            ->setGeofencingRadiusMeters(1)
            ->setDeviceVerificationEnabled(false);

        $effective = EffectiveCheckinSettings::fromQrCode($qr);

        $this->assertTrue($effective->ipRestrictionEnabled);
        $this->assertSame(['1.2.3.4'], $effective->allowedIps);
        $this->assertTrue($effective->geofencingEnabled);
        $this->assertSame(11.55, $effective->geofencingLatitude);
        $this->assertSame(104.9, $effective->geofencingLongitude);
        $this->assertSame(50, $effective->geofencingRadiusMeters);
        $this->assertTrue($effective->deviceVerificationEnabled);
    }

    public function testFromQrCodeUsesQrOverridesWhenInheritFlagsFalse(): void
    {
        $workspace = $this->workspaceWithRichSetting();
        $qr = (new WorkspaceQrCode())
            ->setWorkspace($workspace)
            ->setInheritIpSettings(false)
            ->setIpRestrictionEnabled(true)
            ->setAllowedIps(['10.0.0.1'])
            ->setInheritGeofencing(false)
            ->setGeofencingEnabled(true)
            ->setGeofencingLatitude(13.75)
            ->setGeofencingLongitude(100.5)
            ->setGeofencingRadiusMeters(75)
            ->setInheritDeviceVerification(false)
            ->setDeviceVerificationEnabled(false);

        $effective = EffectiveCheckinSettings::fromQrCode($qr);

        $this->assertTrue($effective->ipRestrictionEnabled);
        $this->assertSame(['10.0.0.1'], $effective->allowedIps);
        $this->assertTrue($effective->geofencingEnabled);
        $this->assertSame(13.75, $effective->geofencingLatitude);
        $this->assertSame(100.5, $effective->geofencingLongitude);
        $this->assertSame(75, $effective->geofencingRadiusMeters);
        $this->assertFalse($effective->deviceVerificationEnabled);
    }

    public function testFromQrCodeMixesInheritAndOverridePerCluster(): void
    {
        $workspace = $this->workspaceWithRichSetting();
        $qr = (new WorkspaceQrCode())
            ->setWorkspace($workspace)
            ->setInheritIpSettings(true)
            ->setInheritGeofencing(false)
            ->setGeofencingEnabled(true)
            ->setGeofencingLatitude(13.75)
            ->setGeofencingLongitude(100.5)
            ->setGeofencingRadiusMeters(75)
            ->setInheritDeviceVerification(true);

        $effective = EffectiveCheckinSettings::fromQrCode($qr);

        // IP — inherited
        $this->assertTrue($effective->ipRestrictionEnabled);
        $this->assertSame(['1.2.3.4'], $effective->allowedIps);
        // Geofence — overridden
        $this->assertSame(13.75, $effective->geofencingLatitude);
        $this->assertSame(75, $effective->geofencingRadiusMeters);
        // Device — inherited
        $this->assertTrue($effective->deviceVerificationEnabled);
    }

    public function testFromQrCodeAlwaysReadsTimezoneFromWorkspace(): void
    {
        $workspace = $this->workspaceWithRichSetting();
        $qr = (new WorkspaceQrCode())
            ->setWorkspace($workspace)
            ->setInheritIpSettings(false)
            ->setInheritGeofencing(false)
            ->setInheritDeviceVerification(false);

        $effective = EffectiveCheckinSettings::fromQrCode($qr);

        $this->assertSame('Asia/Phnom_Penh', $effective->timezone);
    }

    private function workspaceWithRichSetting(): Workspace
    {
        $workspace = new Workspace();
        $setting = (new WorkspaceSetting())
            ->setTimezone('Asia/Phnom_Penh')
            ->setIpRestrictionEnabled(true)
            ->setAllowedIps(['1.2.3.4'])
            ->setGeofencingEnabled(true)
            ->setGeofencingLatitude(11.55)
            ->setGeofencingLongitude(104.9)
            ->setGeofencingRadiusMeters(50)
            ->setDeviceVerificationEnabled(true);
        $workspace->setSetting($setting);
        return $workspace;
    }
}

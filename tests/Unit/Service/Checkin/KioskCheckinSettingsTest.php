<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Checkin;

use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Service\Checkin\KioskCheckinSettings;
use PHPUnit\Framework\TestCase;

class KioskCheckinSettingsTest extends TestCase
{
    private function workspace(): Workspace
    {
        $setting = (new WorkspaceSetting())
            ->setTimezone('Asia/Phnom_Penh')
            ->setIpRestrictionEnabled(true)
            ->setAllowedIps(['203.0.113.7'])
            ->setDeviceVerificationEnabled(true)
            ->setGeofencingEnabled(true)
            ->setGeofencingLatitude(11.55)
            ->setGeofencingLongitude(104.92)
            ->setGeofencingRadiusMeters(120);

        $workspace = new Workspace();
        $workspace->setSetting($setting);

        return $workspace;
    }

    public function testDeviceVerificationIsOffBecauseTheKioskIsSharedByEveryone(): void
    {
        $settings = KioskCheckinSettings::forWorkspace($this->workspace());

        // Left on, the first tap of the morning binds the kiosk to that employee
        // and every colleague after them is refused.
        self::assertFalse($settings->deviceVerificationEnabled);
    }

    public function testGeofencingIsOffBecauseAKioskHasNoGpsToOffer(): void
    {
        $settings = KioskCheckinSettings::forWorkspace($this->workspace());

        // The pipeline refuses a check-in outright when geofencing is on and no
        // coordinates arrive, which would make every tap fail.
        self::assertFalse($settings->geofencingEnabled);
        self::assertNull($settings->geofencingLatitude);
        self::assertNull($settings->geofencingLongitude);
    }

    public function testIpRestrictionSurvivesBecauseItIsTheControlThatStillMeansSomething(): void
    {
        $settings = KioskCheckinSettings::forWorkspace($this->workspace());

        self::assertTrue($settings->ipRestrictionEnabled);
        self::assertSame(['203.0.113.7'], $settings->allowedIps);
    }

    public function testTimezoneIsPreserved(): void
    {
        self::assertSame('Asia/Phnom_Penh', KioskCheckinSettings::forWorkspace($this->workspace())->timezone);
    }

    public function testAWorkspaceWithNoSettingsStillProducesUsableDefaults(): void
    {
        $settings = KioskCheckinSettings::forWorkspace(new Workspace());

        self::assertSame('UTC', $settings->timezone);
        self::assertFalse($settings->ipRestrictionEnabled);
        self::assertFalse($settings->deviceVerificationEnabled);
    }
}

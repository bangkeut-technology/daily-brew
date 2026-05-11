<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\WorkspaceSetting;
use PHPUnit\Framework\TestCase;

class WorkspaceSettingTest extends TestCase
{
    public function testDefaultsMatchProjectConventions(): void
    {
        $s = new WorkspaceSetting();

        // Timezone default is the Cambodia office timezone (per CLAUDE.md).
        $this->assertSame('Asia/Phnom_Penh', $s->getTimezone());
        $this->assertSame('DD/MM/YYYY', $s->getDateFormat());

        // All security/feature flags default to OFF — must be explicitly enabled per workspace.
        $this->assertFalse($s->isIpRestrictionEnabled());
        $this->assertFalse($s->isDeviceVerificationEnabled());
        $this->assertFalse($s->isGeofencingEnabled());
        $this->assertFalse($s->isTelegramNotificationsEnabled());

        $this->assertNull($s->getAllowedIps());
        $this->assertNull($s->getGeofencingLatitude());
        $this->assertNull($s->getGeofencingLongitude());
        $this->assertSame(100, $s->getGeofencingRadiusMeters());
        $this->assertNull($s->getTelegramChatId());
    }

    public function testFlagsRoundTrip(): void
    {
        $s = (new WorkspaceSetting())
            ->setIpRestrictionEnabled(true)
            ->setDeviceVerificationEnabled(true)
            ->setGeofencingEnabled(true)
            ->setTelegramNotificationsEnabled(true);

        $this->assertTrue($s->isIpRestrictionEnabled());
        $this->assertTrue($s->isDeviceVerificationEnabled());
        $this->assertTrue($s->isGeofencingEnabled());
        $this->assertTrue($s->isTelegramNotificationsEnabled());
    }

    public function testIpRestrictionAcceptsListOrNull(): void
    {
        $s = new WorkspaceSetting();

        $s->setAllowedIps(['203.0.113.5', '198.51.100.7']);
        $this->assertSame(['203.0.113.5', '198.51.100.7'], $s->getAllowedIps());

        $s->setAllowedIps(null);
        $this->assertNull($s->getAllowedIps());
    }

    public function testGeofencingValuesRoundTrip(): void
    {
        $s = (new WorkspaceSetting())
            ->setGeofencingEnabled(true)
            ->setGeofencingLatitude(11.55)
            ->setGeofencingLongitude(104.9)
            ->setGeofencingRadiusMeters(75);

        $this->assertSame(11.55, $s->getGeofencingLatitude());
        $this->assertSame(104.9, $s->getGeofencingLongitude());
        $this->assertSame(75, $s->getGeofencingRadiusMeters());
    }

    public function testTimezoneAndDateFormatCanBeOverridden(): void
    {
        $s = (new WorkspaceSetting())
            ->setTimezone('Europe/Paris')
            ->setDateFormat('MM/DD/YYYY');

        $this->assertSame('Europe/Paris', $s->getTimezone());
        $this->assertSame('MM/DD/YYYY', $s->getDateFormat());
    }

    public function testTelegramChatIdAcceptsStringOrNull(): void
    {
        $s = (new WorkspaceSetting())->setTelegramChatId('@my_chat');
        $this->assertSame('@my_chat', $s->getTelegramChatId());

        $s->setTelegramChatId(null);
        $this->assertNull($s->getTelegramChatId());
    }
}

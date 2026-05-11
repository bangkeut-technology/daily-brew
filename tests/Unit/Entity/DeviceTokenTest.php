<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\DeviceToken;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class DeviceTokenTest extends TestCase
{
    public function testTokenPlatformAndUserRoundTrip(): void
    {
        $user = new User();
        $dt = (new DeviceToken())
            ->setToken('ExpoToken[abc]')
            ->setPlatform('ios')
            ->setUser($user);

        $this->assertSame('ExpoToken[abc]', $dt->getToken());
        $this->assertSame('ios', $dt->getPlatform());
        $this->assertSame($user, $dt->getUser());
    }

    public function testPlatformAcceptsKnownValues(): void
    {
        foreach (['ios', 'android', 'web'] as $platform) {
            $dt = (new DeviceToken())->setPlatform($platform);
            $this->assertSame($platform, $dt->getPlatform());
        }
    }
}

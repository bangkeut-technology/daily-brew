<?php

declare(strict_types=1);

namespace Bangkeut\TapBundle\Tests;

use Bangkeut\TapBundle\Nonce\CacheNonceStore;
use PHPUnit\Framework\TestCase;
use Psr\Cache\CacheItemInterface;
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\Cache\Adapter\ArrayAdapter;

class CacheNonceStoreTest extends TestCase
{
    public function testAFirstUseIsClaimedAndARepeatIsRefused(): void
    {
        $store = new CacheNonceStore(new ArrayAdapter());

        $this->assertTrue($store->consume('nonce:gate-a', 'abc', 900));
        $this->assertFalse($store->consume('nonce:gate-a', 'abc', 900));
    }

    public function testScopesDoNotCollide(): void
    {
        $store = new CacheNonceStore(new ArrayAdapter());

        $this->assertTrue($store->consume('nonce:gate-a', 'abc', 900));
        // Same token, different terminal — a legitimately different tap.
        $this->assertTrue($store->consume('nonce:gate-b', 'abc', 900));
        // Same token, same terminal, different purpose (anti-passback vs replay).
        $this->assertTrue($store->consume('pass:gate-a', 'abc', 900));
    }

    public function testTheTtlIsPassedThroughSoClaimsExpire(): void
    {
        $item = $this->createMock(CacheItemInterface::class);
        $item->method('isHit')->willReturn(false);
        $item->method('set')->willReturnSelf();
        $item->expects($this->once())->method('expiresAfter')->with(42)->willReturnSelf();

        $pool = $this->createMock(CacheItemPoolInterface::class);
        $pool->method('getItem')->willReturn($item);
        $pool->expects($this->once())->method('save');

        $this->assertTrue((new CacheNonceStore($pool))->consume('nonce:gate-a', 'abc', 42));
    }
}

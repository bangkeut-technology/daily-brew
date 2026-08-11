<?php

declare(strict_types=1);

namespace Bangkeut\TapBundle\Nonce;

use Bangkeut\Tap\Nonce\NonceStore;
use Psr\Cache\CacheItemPoolInterface;

/**
 * PSR-6 backed nonce store.
 *
 * **Read this before using it for a paid gate.** PSR-6 has no compare-and-set, so two simultaneous
 * presentations of the same nonce can both see a miss and both be admitted. The window is
 * milliseconds and irrelevant for a shift kiosk; for a turnstile where a double-open is revenue
 * loss, back the store with a unique database constraint instead — the insert either succeeds or
 * violates, which is the atomicity the interface asks for.
 *
 * The cache key is hashed: a nonce is not a secret, but terminal ids end up in cache keys otherwise,
 * and some adapters are picky about key characters.
 */
final readonly class CacheNonceStore implements NonceStore
{
    public function __construct(private CacheItemPoolInterface $cache)
    {
    }

    public function consume(string $scope, string $token, int $ttlSeconds): bool
    {
        $item = $this->cache->getItem('bktap.'.hash('xxh128', $scope.'|'.$token));
        if ($item->isHit()) {
            return false;
        }

        $item->set(true)->expiresAfter($ttlSeconds);
        $this->cache->save($item);

        return true;
    }
}

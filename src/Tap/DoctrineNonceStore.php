<?php

declare(strict_types=1);

namespace App\Tap;

use App\Repository\TapNonceRepository;
use Bangkeut\Tap\Nonce\NonceStore;

/**
 * Single-use bookkeeping backed by a unique database key.
 *
 * The bundle ships a cache-backed store and its docblock says to read this
 * warning before using it on a gate that matters: PSR-6 has no compare-and-set,
 * so two taps in the same moment can both find the slot empty and both be
 * admitted. Anti-passback on a shared card is exactly that case — a queue of
 * people tapping one card in quick succession — so the claim has to be a write
 * the database arbitrates.
 */
final readonly class DoctrineNonceStore implements NonceStore
{
    public function __construct(private TapNonceRepository $nonces)
    {
    }

    public function consume(string $scope, string $token, int $ttlSeconds): bool
    {
        return $this->nonces->claim($scope, $token, $ttlSeconds);
    }
}

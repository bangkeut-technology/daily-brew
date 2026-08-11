<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Nonce;

/**
 * Single-use bookkeeping. Two callers, one primitive:
 *
 *  - device assertions consume the terminal's nonce, so a captured tap can't be replayed;
 *  - issued passes consume the pass id for a cooldown, which is anti-passback.
 *
 * Implementations must be atomic — a check-then-write race is a door that opens twice.
 */
interface NonceStore
{
    /**
     * Claim a token within a scope. Returns true on first use, false if it was already claimed and
     * has not yet expired.
     */
    public function consume(string $scope, string $token, int $ttlSeconds): bool;
}

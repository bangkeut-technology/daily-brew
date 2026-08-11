<?php

declare(strict_types=1);

namespace Bangkeut\Tap;

/**
 * The knobs that differ between deployments. A shift kiosk and a conference door want the same
 * cryptography and different tolerances, so none of this is hardcoded in the verifier.
 */
final readonly class TapPolicy
{
    public function __construct(
        /** How stale a device assertion's own timestamp may be. Covers NFC retries and slow networks. */
        public int $maxAgeSeconds = 120,
        /** Tolerance for a device clock that runs fast. Kept small — it widens the replay window. */
        public int $maxFutureSkewSeconds = 30,
        /** How long a consumed nonce is remembered. Must exceed maxAgeSeconds or replay reopens. */
        public int $nonceTtlSeconds = 900,
        /**
         * Anti-passback for issued passes: the same pass at the same terminal inside this window is
         * rejected. 0 disables it — right for a re-entry-friendly door, wrong for a paid gate.
         */
        public int $passReuseCooldownSeconds = 0,
        /**
         * Freshness window when replaying a terminal's offline queue. Generous by design: a door
         * that lost wifi for a day must still be able to hand over what it recorded.
         */
        public int $batchMaxAgeSeconds = 86400,
    ) {
    }

    public function assertionMaxAge(bool $offlineBatch): int
    {
        return $offlineBatch ? $this->batchMaxAgeSeconds : $this->maxAgeSeconds;
    }
}

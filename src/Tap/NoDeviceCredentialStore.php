<?php

declare(strict_types=1);

namespace App\Tap;

use Bangkeut\Tap\Credential\CredentialStore;

/**
 * No device credentials are enrolled: DailyBrew issues cards, not device keys.
 *
 * This is the seam, not dead code. `TapVerifier` requires a CredentialStore
 * because it can verify both credential kinds; card check-in only ever presents
 * kind 0x02, which never consults this. The day a phone becomes a credential —
 * an employee's device signing the terminal's nonce — this class is replaced by
 * one reading enrolled public keys, and nothing else moves.
 *
 * Returning nothing is a refusal, not a bypass: an empty result fails a device
 * assertion outright.
 */
final readonly class NoDeviceCredentialStore implements CredentialStore
{
    /** @return iterable<never> */
    public function activeCredentialsFor(string $holderId): iterable
    {
        return [];
    }
}

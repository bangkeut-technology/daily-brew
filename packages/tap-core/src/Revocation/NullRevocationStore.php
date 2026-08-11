<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Revocation;

/**
 * "This deployment does not revoke passes."
 *
 * The default, so that a device-only deployment — a shift kiosk, where revocation lives in the
 * credential store — doesn't have to think about it. Naming it explicitly beats a nullable
 * dependency: a store that is absent and a store that answers "nothing is revoked" behave the same,
 * and only one of them says so out loud in a constructor.
 *
 * If you issue passes that can be refunded, cancelled or lost, this is the wrong choice.
 */
final class NullRevocationStore implements RevocationStore
{
    public function isRevoked(string $passId, string $audienceId): bool
    {
        return false;
    }
}

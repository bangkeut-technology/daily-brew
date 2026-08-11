<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Revocation;

/**
 * Whether a pass that is otherwise valid has been withdrawn — refunded, lost, transferred, banned.
 *
 * Issued passes need this and device assertions do not: a device key is revoked by dropping it from
 * {@see \Bangkeut\Tap\Credential\CredentialStore}, so the credential simply stops matching. A pass
 * carries its own authority in a signature the issuer can no longer reach, so the only way to take
 * one back is for the door to be told.
 *
 * Implementations must be fast and must not fail open: an exception propagates and refuses the tap,
 * which is the right answer when the door cannot tell whether a ticket is still good.
 */
interface RevocationStore
{
    /**
     * @param string $passId     the pass presented
     * @param string $audienceId the event it was minted for — scoped so a terminal only has to know
     *                           about its own event's revocations
     */
    public function isRevoked(string $passId, string $audienceId): bool;
}

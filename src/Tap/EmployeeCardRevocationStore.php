<?php

declare(strict_types=1);

namespace App\Tap;

use App\Repository\EmployeeCardRepository;
use Bangkeut\Tap\Revocation\RevocationStore;

/**
 * Whether a card that verifies has nonetheless been taken back.
 *
 * Mandatory here, though optional in the library: a card is a bearer
 * credential, so "Sokha lost her card" has no cryptographic answer. The
 * signature stays valid until the window closes, and the only way to stop it is
 * to tell the door.
 *
 * **An unknown pass id counts as revoked.** A signature that verifies against a
 * workspace key but names no card we hold is not a card we should admit.
 *
 * Fails closed by construction: a repository exception propagates and the tap
 * is refused, which is the right answer when the door cannot tell whether a
 * card is still good.
 */
final readonly class EmployeeCardRevocationStore implements RevocationStore
{
    public function __construct(private EmployeeCardRepository $cards)
    {
    }

    public function isRevoked(string $passId, string $audienceId): bool
    {
        $card = $this->cards->findByPassIdAndWorkspacePublicId($passId, $audienceId);

        return $card === null || $card->isRevoked();
    }
}

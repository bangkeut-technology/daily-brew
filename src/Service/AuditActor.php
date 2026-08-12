<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\ApiToken;
use App\Entity\User;

/**
 * Who performed an audited action.
 *
 * The attendance audit columns assume a human — `editedBy` is a User FK,
 * `editedByEmail` its snapshot. An API write has no human behind it, and
 * borrowing the workspace owner's identity would put their name on something
 * they didn't do. So the actor becomes a small value object: a user when there
 * is one, a label when there isn't.
 *
 * `editedByEmail` was already a snapshot string (it has to survive the account
 * being deleted), which is why an api-token label fits without a schema change.
 */
final readonly class AuditActor
{
    private function __construct(
        public ?User $user,
        /** Goes into the `editedByEmail` / `voidedByEmail` snapshot. */
        public string $label,
    ) {
    }

    public static function forUser(User $user): self
    {
        return new self($user, (string) $user->getEmail());
    }

    /**
     * An external integration. The label is deliberately prefixed so the UI's
     * "Edited by" line reads `api-token:Turnstile production` — obviously not a
     * person, and it names which key did it.
     */
    public static function forApiToken(ApiToken $token): self
    {
        return new self(null, 'api-token:'.$token->getName());
    }
}

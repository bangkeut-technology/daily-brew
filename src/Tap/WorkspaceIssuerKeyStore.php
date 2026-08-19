<?php

declare(strict_types=1);

namespace App\Tap;

use App\Repository\WorkspaceIssuerKeyRepository;
use Bangkeut\Tap\Credential\IssuerKeyStore;

/**
 * Publishes the public keys a terminal should trust for one workspace.
 *
 * The audience is the workspace's publicId — 12 chars from the same alphabet
 * the protocol's ids use, so no encoding sits between the two systems.
 *
 * Retired keys are returned alongside the active one, newest first. Dropping a
 * retired key the moment it is rotated out would refuse every card already in
 * an employee's pocket; they stop being served when the cards they signed have
 * expired.
 */
final readonly class WorkspaceIssuerKeyStore implements IssuerKeyStore
{
    public function __construct(private WorkspaceIssuerKeyRepository $keys)
    {
    }

    /** @return iterable<string> */
    public function publicKeysFor(string $audienceId): iterable
    {
        foreach ($this->keys->findAllForWorkspacePublicId($audienceId) as $key) {
            yield $key->getPublicKeyPem();
        }
    }
}

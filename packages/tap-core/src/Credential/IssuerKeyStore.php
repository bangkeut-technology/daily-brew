<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Credential;

interface IssuerKeyStore
{
    /**
     * Public keys trusted to mint passes for an audience, newest first. Several are returned so a
     * signing key can be rotated without invalidating passes already in attendees' wallets.
     *
     * @return iterable<string> PEM-encoded SubjectPublicKeyInfo, P-256
     */
    public function publicKeysFor(string $audienceId): iterable;
}

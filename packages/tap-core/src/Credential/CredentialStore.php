<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Credential;

interface CredentialStore
{
    /**
     * Active credentials for a holder — revoked ones must not be returned. An empty result is a
     * rejected tap, so filtering here is a security boundary, not a convenience.
     *
     * @return iterable<Credential>
     */
    public function activeCredentialsFor(string $holderId): iterable;
}

<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests\Support;

use Bangkeut\Tap\Credential\Credential;
use Bangkeut\Tap\Credential\CredentialStore;

final class InMemoryCredentialStore implements CredentialStore
{
    /** @var array<string, list<Credential>> */
    private array $byHolder = [];

    public function add(Credential $credential): void
    {
        $this->byHolder[$credential->holderId()][] = $credential;
    }

    public function activeCredentialsFor(string $holderId): iterable
    {
        return $this->byHolder[$holderId] ?? [];
    }
}

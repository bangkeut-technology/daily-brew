<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests\Support;

use Bangkeut\Tap\Credential\IssuerKeyStore;

final class InMemoryIssuerKeyStore implements IssuerKeyStore
{
    /** @var array<string, list<string>> */
    private array $byAudience = [];

    public function add(string $audienceId, string $publicKeyPem): void
    {
        $this->byAudience[$audienceId][] = $publicKeyPem;
    }

    public function publicKeysFor(string $audienceId): iterable
    {
        return $this->byAudience[$audienceId] ?? [];
    }
}

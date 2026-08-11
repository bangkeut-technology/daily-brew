<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests\Support;

use Bangkeut\Tap\Credential\Credential;

final class InMemoryCredential implements Credential
{
    public function __construct(
        private string $credentialId,
        private string $holderId,
        private string $publicKeyPem,
    ) {
    }

    public function credentialId(): string
    {
        return $this->credentialId;
    }

    public function holderId(): string
    {
        return $this->holderId;
    }

    public function publicKeyPem(): string
    {
        return $this->publicKeyPem;
    }
}

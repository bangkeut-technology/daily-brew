<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests\Support;

use Bangkeut\Tap\Nonce\NonceStore;

final class InMemoryNonceStore implements NonceStore
{
    /** @var array<string, true> */
    public array $claimed = [];

    public function consume(string $scope, string $token, int $ttlSeconds): bool
    {
        $key = $scope.'|'.$token;
        if (isset($this->claimed[$key])) {
            return false;
        }
        $this->claimed[$key] = true;

        return true;
    }
}

<?php

declare(strict_types=1);

namespace App\Service;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Verifies Apple Sign-In identity tokens (JWTs) against Apple's public keys.
 */
final readonly class AppleTokenVerifier
{
    private const APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys';
    private const APPLE_ISSUER = 'https://appleid.apple.com';

    public function __construct(
        private HttpClientInterface $httpClient,
        private CacheInterface $cache,
        private string $appleClientId,
    ) {}

    /**
     * @return array{sub: string, email: string} Verified payload
     * @throws \InvalidArgumentException If the token is invalid
     */
    public function verify(string $identityToken): array
    {
        $keys = $this->getApplePublicKeys();

        try {
            $decoded = JWT::decode($identityToken, JWK::parseKeySet($keys));
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('Invalid Apple identity token: ' . $e->getMessage());
        }

        $payload = (array) $decoded;

        // Verify issuer
        if (($payload['iss'] ?? '') !== self::APPLE_ISSUER) {
            throw new \InvalidArgumentException('Invalid Apple token issuer');
        }

        // Verify audience matches our app's client ID
        if (($payload['aud'] ?? '') !== $this->appleClientId) {
            throw new \InvalidArgumentException('Invalid Apple token audience');
        }

        // Verify token hasn't expired
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new \InvalidArgumentException('Apple token has expired');
        }

        $sub = $payload['sub'] ?? '';
        $email = $payload['email'] ?? '';

        if (empty($sub)) {
            throw new \InvalidArgumentException('Apple token missing sub claim');
        }

        return ['sub' => $sub, 'email' => $email];
    }

    private function getApplePublicKeys(): array
    {
        return $this->cache->get('apple_auth_keys', function (ItemInterface $item): array {
            $item->expiresAfter(86400); // Cache for 24 hours

            $response = $this->httpClient->request('GET', self::APPLE_KEYS_URL);

            if ($response->getStatusCode() !== 200) {
                throw new \RuntimeException('Failed to fetch Apple public keys');
            }

            return $response->toArray();
        });
    }
}

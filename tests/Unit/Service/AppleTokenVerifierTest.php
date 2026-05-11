<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Service\AppleTokenVerifier;
use Firebase\JWT\JWT;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

#[AllowMockObjectsWithoutExpectations]
class AppleTokenVerifierTest extends TestCase
{
    private const string APPLE_ISSUER = 'https://appleid.apple.com';
    private const string WEB_CLIENT_ID = 'work.dailybrew.web';
    private const string IOS_CLIENT_ID = 'work.dailybrew.ios';
    private const string KEY_ID = 'test-key-id';

    /**
     * @var array{privateKey: \OpenSSLAsymmetricKey, publicJwk: array}
     */
    private static array $keypair;

    private HttpClientInterface&MockObject $httpClient;
    private CacheInterface&MockObject $cache;
    private AppleTokenVerifier $verifier;

    public static function setUpBeforeClass(): void
    {
        if (!extension_loaded('openssl')) {
            self::markTestSkipped('openssl extension required to forge Apple-style RSA JWTs');
        }

        // Generate one RSA keypair for the whole test class — generation is the slow part.
        $resource = openssl_pkey_new([
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);
        if ($resource === false) {
            self::markTestSkipped('openssl_pkey_new returned false');
        }

        $details = openssl_pkey_get_details($resource);
        if ($details === false || !isset($details['rsa'])) {
            self::markTestSkipped('openssl_pkey_get_details failed');
        }

        self::$keypair = [
            'privateKey' => $resource,
            'publicJwk' => [
                'kty' => 'RSA',
                'kid' => self::KEY_ID,
                'use' => 'sig',
                'alg' => 'RS256',
                'n' => self::base64Url($details['rsa']['n']),
                'e' => self::base64Url($details['rsa']['e']),
            ],
        ];
    }

    protected function setUp(): void
    {
        $this->httpClient = $this->createMock(HttpClientInterface::class);
        $this->cache = $this->createMock(CacheInterface::class);
        $this->verifier = new AppleTokenVerifier(
            $this->httpClient,
            $this->cache,
            self::WEB_CLIENT_ID,
            self::IOS_CLIENT_ID,
        );
    }

    public function testVerifyAcceptsValidTokenSignedWithWebClientAudience(): void
    {
        $this->stubCacheToReturnTestJwks();

        $token = $this->mintToken([
            'iss' => self::APPLE_ISSUER,
            'aud' => self::WEB_CLIENT_ID,
            'sub' => '001234.abc',
            'email' => 'user@privaterelay.appleid.com',
            'exp' => time() + 600,
            'iat' => time(),
        ]);

        $result = $this->verifier->verify($token);

        $this->assertSame('001234.abc', $result['sub']);
        $this->assertSame('user@privaterelay.appleid.com', $result['email']);
    }

    public function testVerifyAcceptsValidTokenSignedWithIosClientAudience(): void
    {
        $this->stubCacheToReturnTestJwks();

        $token = $this->mintToken([
            'iss' => self::APPLE_ISSUER,
            'aud' => self::IOS_CLIENT_ID,
            'sub' => '001234.def',
            'email' => 'ios@example.com',
            'exp' => time() + 600,
            'iat' => time(),
        ]);

        $result = $this->verifier->verify($token);

        $this->assertSame('001234.def', $result['sub']);
    }

    public function testVerifyRejectsTokenWithWrongIssuer(): void
    {
        $this->stubCacheToReturnTestJwks();

        $token = $this->mintToken([
            'iss' => 'https://impostor.example.com',
            'aud' => self::WEB_CLIENT_ID,
            'sub' => '001234.abc',
            'email' => 'a@b.com',
            'exp' => time() + 600,
            'iat' => time(),
        ]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid Apple token issuer');

        $this->verifier->verify($token);
    }

    public function testVerifyRejectsTokenWithUnrelatedAudience(): void
    {
        $this->stubCacheToReturnTestJwks();

        $token = $this->mintToken([
            'iss' => self::APPLE_ISSUER,
            'aud' => 'work.someoneelse.app',
            'sub' => '001234.abc',
            'email' => 'a@b.com',
            'exp' => time() + 600,
            'iat' => time(),
        ]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid Apple token audience');

        $this->verifier->verify($token);
    }

    public function testVerifyRejectsTokenSignedWithWrongKey(): void
    {
        // Mint a token with a *different* private key than the one Apple's JWKS exposes.
        $alienKey = openssl_pkey_new([
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);
        $token = JWT::encode(
            [
                'iss' => self::APPLE_ISSUER,
                'aud' => self::WEB_CLIENT_ID,
                'sub' => '001234.abc',
                'exp' => time() + 600,
            ],
            $alienKey,
            'RS256',
            self::KEY_ID,
        );

        $this->stubCacheToReturnTestJwks();

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid Apple identity token');

        $this->verifier->verify($token);
    }

    public function testVerifyRejectsExpiredToken(): void
    {
        $this->stubCacheToReturnTestJwks();

        // Firebase JWT's decode() already enforces exp, so it raises ExpiredException
        // wrapped by the verifier as InvalidArgumentException.
        $token = $this->mintToken([
            'iss' => self::APPLE_ISSUER,
            'aud' => self::WEB_CLIENT_ID,
            'sub' => '001234.abc',
            'exp' => time() - 60,
            'iat' => time() - 120,
        ]);

        $this->expectException(\InvalidArgumentException::class);

        $this->verifier->verify($token);
    }

    public function testVerifyRejectsTokenMissingSubClaim(): void
    {
        $this->stubCacheToReturnTestJwks();

        $token = $this->mintToken([
            'iss' => self::APPLE_ISSUER,
            'aud' => self::WEB_CLIENT_ID,
            'email' => 'a@b.com',
            'exp' => time() + 600,
            'iat' => time(),
        ]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('missing sub claim');

        $this->verifier->verify($token);
    }

    public function testVerifyRejectsCompletelyMalformedToken(): void
    {
        $this->stubCacheToReturnTestJwks();

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid Apple identity token');

        $this->verifier->verify('not.a.jwt');
    }

    public function testVerifyFetchesJwksViaHttpOnCacheMissAndRaisesOnNon200(): void
    {
        // Simulate the cache calling the callback (cache miss → real HTTP fetch).
        $item = $this->createMock(ItemInterface::class);
        $this->cache->method('get')->willReturnCallback(
            fn (string $key, callable $cb) => $cb($item),
        );

        $response = $this->createConfiguredMock(ResponseInterface::class, [
            'getStatusCode' => 503,
        ]);
        $this->httpClient->method('request')->willReturn($response);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Failed to fetch Apple public keys');

        $this->verifier->verify('any-token');
    }

    // ── Helpers ───────────────────────────────────────────────────────

    /** Mock cache to skip the HTTP call and return our generated JWKS directly. */
    private function stubCacheToReturnTestJwks(): void
    {
        $this->cache->method('get')->willReturn(['keys' => [self::$keypair['publicJwk']]]);
    }

    /** Sign a JWT with the test private key, using the `kid` Apple's JWKS exposes. */
    private function mintToken(array $payload): string
    {
        return JWT::encode($payload, self::$keypair['privateKey'], 'RS256', self::KEY_ID);
    }

    private static function base64Url(string $binary): string
    {
        return rtrim(strtr(base64_encode($binary), '+/', '-_'), '=');
    }
}

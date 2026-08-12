<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Integration;

use App\Entity\ApiToken;
use App\Entity\Workspace;
use App\Enum\ApiTokenScopeEnum;
use App\Repository\ApiTokenRepository;
use App\Service\Integration\ApiTokenMinter;
use App\Service\Integration\SecretCipher;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

#[AllowMockObjectsWithoutExpectations]
class ApiTokenMinterTest extends TestCase
{
    private ApiTokenRepository&MockObject $repository;
    private SecretCipher $cipher;
    private ApiTokenMinter $minter;

    protected function setUp(): void
    {
        $this->repository = $this->createMock(ApiTokenRepository::class);
        $this->cipher = new SecretCipher(base64_encode(str_repeat("\x09", SODIUM_CRYPTO_SECRETBOX_KEYBYTES)), '');
        $this->minter = new ApiTokenMinter($this->repository, $this->cipher);
    }

    public function testReturnsBothSecretsInPlaintextExactlyOnce(): void
    {
        $result = $this->minter->mint(new Workspace(), 'Turnstile', [ApiTokenScopeEnum::WriteAttendance]);

        $this->assertStringStartsWith('db_', $result['plainToken']);
        $this->assertStringStartsWith('dbs_', $result['plainSigningSecret']);

        // Neither is recoverable from the row: the token is a digest, the secret
        // is ciphertext. Losing them means re-minting, not looking them up.
        $this->assertNotSame($result['plainToken'], $result['token']->getTokenHash());
        $this->assertNotSame($result['plainSigningSecret'], $result['token']->getSigningSecretEncrypted());
    }

    public function testTheStoredSecretDecryptsBackToTheOneHandedOut(): void
    {
        $result = $this->minter->mint(new Workspace(), 'Turnstile', [ApiTokenScopeEnum::WriteAttendance]);

        $this->assertSame(
            $result['plainSigningSecret'],
            $this->cipher->decrypt((string) $result['token']->getSigningSecretEncrypted()),
        );
    }

    public function testEvenAReadOnlyTokenGetsASigningSecret(): void
    {
        $result = $this->minter->mint(new Workspace(), 'BasilBook', [ApiTokenScopeEnum::ReadAttendance]);

        // Costs 32 bytes and means granting write access later doesn't force a
        // re-issue on a system that's already integrated.
        $this->assertTrue($result['token']->canSign());
        $this->assertSame(['attendance:read'], $result['token']->getScopeValues());
    }

    public function testSecretsAreUniquePerToken(): void
    {
        $secrets = [];
        for ($i = 0; $i < 5; $i++) {
            $secrets[] = $this->minter->mint(new Workspace(), 'tok', [])['plainSigningSecret'];
        }

        $this->assertCount(5, array_unique($secrets));
    }

    public function testPersistsAndFlushesTheToken(): void
    {
        $this->repository->expects($this->once())->method('persist')->with($this->isInstanceOf(ApiToken::class));
        $this->repository->expects($this->once())->method('flush');

        $this->minter->mint(new Workspace(), 'tok', []);
    }
}

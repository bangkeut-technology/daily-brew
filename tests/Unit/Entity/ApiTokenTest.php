<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\ApiToken;
use App\Entity\Workspace;
use App\Enum\ApiTokenScopeEnum;
use PHPUnit\Framework\TestCase;

class ApiTokenTest extends TestCase
{
    public function testCreateReturnsEntityAndPlainToken(): void
    {
        $workspace = new Workspace();
        $result = ApiToken::create($workspace, 'BasilBook');

        $this->assertArrayHasKey('entity', $result);
        $this->assertArrayHasKey('plainToken', $result);
        $this->assertInstanceOf(ApiToken::class, $result['entity']);
        $this->assertIsString($result['plainToken']);
    }

    public function testPlainTokenHasDbPrefixAndExpectedLength(): void
    {
        $workspace = new Workspace();
        ['plainToken' => $plain] = ApiToken::create($workspace, 'tok');

        $this->assertStringStartsWith('db_', $plain);
        // 'db_' (3) + 45 alphanumeric chars per the generator config.
        $this->assertSame(48, strlen($plain));
        $this->assertMatchesRegularExpression('/^db_[a-zA-Z0-9]{45}$/', $plain);
    }

    public function testEntityStoresPrefixAndSha256HashNotPlainToken(): void
    {
        $workspace = new Workspace();
        ['entity' => $entity, 'plainToken' => $plain] = ApiToken::create($workspace, 'tok');

        $this->assertSame(substr($plain, 0, 8), $entity->getPrefix());
        $this->assertSame(hash('sha256', $plain), $entity->getTokenHash());
        $this->assertNotSame($plain, $entity->getTokenHash());
    }

    public function testHashTokenMatchesSha256Hex(): void
    {
        $this->assertSame(hash('sha256', 'foo'), ApiToken::hashToken('foo'));
    }

    public function testFreshTokenIsActive(): void
    {
        ['entity' => $entity] = ApiToken::create(new Workspace(), 'tok');

        $this->assertTrue($entity->isActive());
        $this->assertNull($entity->getRevokedAt());
    }

    public function testRevokingMarksTokenInactive(): void
    {
        ['entity' => $entity] = ApiToken::create(new Workspace(), 'tok');

        $entity->revoke();

        $this->assertFalse($entity->isActive());
        $this->assertNotNull($entity->getRevokedAt());
    }

    public function testDefaultsToReadOnly(): void
    {
        ['entity' => $entity] = ApiToken::create(new Workspace(), 'tok');

        // A token nobody scoped deliberately can read and nothing else. Write
        // access to attendance is never the default.
        $this->assertSame(['attendance:read'], $entity->getScopeValues());
        $this->assertTrue($entity->hasScope(ApiTokenScopeEnum::ReadAttendance));
        $this->assertFalse($entity->hasScope(ApiTokenScopeEnum::WriteAttendance));
    }

    public function testScopesAreStoredWithoutDuplicates(): void
    {
        ['entity' => $entity] = ApiToken::create(new Workspace(), 'tok', [
            ApiTokenScopeEnum::WriteAttendance,
            ApiTokenScopeEnum::ReadAttendance,
            ApiTokenScopeEnum::WriteAttendance,
        ]);

        $this->assertSame(['attendance:write', 'attendance:read'], $entity->getScopeValues());
    }

    public function testATokenWithoutASigningSecretCannotSign(): void
    {
        ['entity' => $entity] = ApiToken::create(new Workspace(), 'tok');

        // This is the shape every pre-signing token has after the migration.
        $this->assertFalse($entity->canSign());

        $entity->setSigningSecretEncrypted('encrypted-blob');
        $this->assertTrue($entity->canSign());
    }

    public function testUnknownScopeValuesAreDroppedRatherThanTrusted(): void
    {
        $scopes = ApiTokenScopeEnum::fromList(['attendance:read', 'attendance:everything', 42, null]);

        $this->assertSame([ApiTokenScopeEnum::ReadAttendance], $scopes);
    }

    public function testGenerateProducesUniqueTokens(): void
    {
        $tokens = [];
        for ($i = 0; $i < 5; $i++) {
            ['plainToken' => $tok] = ApiToken::create(new Workspace(), 'tok');
            $tokens[] = $tok;
        }

        $this->assertCount(5, array_unique($tokens), 'Each generated token should be unique');
    }
}

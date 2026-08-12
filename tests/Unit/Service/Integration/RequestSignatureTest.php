<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Integration;

use App\Service\Integration\RequestSignature;
use PHPUnit\Framework\TestCase;

/**
 * The scheme itself. These assertions are a contract with every client SDK that
 * will ever sign a DailyBrew request — changing the canonical string breaks
 * integrations silently (they just start getting 401s), so it's pinned here on
 * purpose rather than left to whatever the verifier happens to compute.
 */
class RequestSignatureTest extends TestCase
{
    /** Readable on purpose — a realistic-looking key here trips secret scanners. */
    private const string SECRET = 'test-signing-key-not-a-secret';

    public function testCanonicalStringIsTheDocumentedSixLineForm(): void
    {
        $canonical = RequestSignature::canonicalString(
            1786012800,
            'nonce-0123456789',
            'post',
            '/api/v1/integrations/attendances',
            '{"a":1}',
        );

        $this->assertSame(implode("\n", [
            'v1',
            '1786012800',
            'nonce-0123456789',
            // Lower-cased method in, upper-cased method signed: a client that
            // sends "post" and one that sends "POST" must agree.
            'POST',
            '/api/v1/integrations/attendances',
            hash('sha256', '{"a":1}'),
        ]), $canonical);
    }

    public function testBodylessRequestSignsTheHashOfTheEmptyString(): void
    {
        $canonical = RequestSignature::canonicalString(1786012800, 'nonce-0123456789', 'GET', '/x', '');

        $this->assertStringEndsWith(hash('sha256', ''), $canonical);
    }

    public function testSignatureCarriesTheVersionPrefix(): void
    {
        $sig = RequestSignature::sign(self::SECRET, 1786012800, 'nonce-0123456789', 'POST', '/x', '{}');

        $this->assertStringStartsWith('v1=', $sig);
        // 64 hex chars of HMAC-SHA256 after the prefix.
        $this->assertMatchesRegularExpression('/^v1=[0-9a-f]{64}$/', $sig);
    }

    public function testEverySignedComponentChangesTheSignature(): void
    {
        $base = RequestSignature::sign(self::SECRET, 1786012800, 'nonce-0123456789', 'POST', '/x', '{"a":1}');

        $variants = [
            'timestamp' => RequestSignature::sign(self::SECRET, 1786012801, 'nonce-0123456789', 'POST', '/x', '{"a":1}'),
            'nonce' => RequestSignature::sign(self::SECRET, 1786012800, 'nonce-9876543210', 'POST', '/x', '{"a":1}'),
            'method' => RequestSignature::sign(self::SECRET, 1786012800, 'nonce-0123456789', 'PUT', '/x', '{"a":1}'),
            'path' => RequestSignature::sign(self::SECRET, 1786012800, 'nonce-0123456789', 'POST', '/y', '{"a":1}'),
            'body' => RequestSignature::sign(self::SECRET, 1786012800, 'nonce-0123456789', 'POST', '/x', '{"a":2}'),
            'secret' => RequestSignature::sign('other-secret', 1786012800, 'nonce-0123456789', 'POST', '/x', '{"a":1}'),
        ];

        foreach ($variants as $what => $signature) {
            $this->assertNotSame($base, $signature, sprintf('changing the %s must change the signature', $what));
        }
    }

    public function testMatchesRejectsAnythingButTheExactSignature(): void
    {
        $sig = RequestSignature::sign(self::SECRET, 1786012800, 'nonce-0123456789', 'POST', '/x', '{}');

        $this->assertTrue(RequestSignature::matches($sig, $sig));
        $this->assertFalse(RequestSignature::matches($sig, substr($sig, 0, -1).'0'));
        // A caller sending only the MAC without the version prefix is not close enough.
        $this->assertFalse(RequestSignature::matches($sig, substr($sig, 3)));
        $this->assertFalse(RequestSignature::matches($sig, ''));
    }
}

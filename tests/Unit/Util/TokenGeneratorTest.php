<?php

declare(strict_types=1);

namespace App\Tests\Unit\Util;

use App\Util\TokenGenerator;
use PHPUnit\Framework\TestCase;

class TokenGeneratorTest extends TestCase
{
    public function testGenerateReturnsCorrectLength(): void
    {
        $token = TokenGenerator::generate(length: 16);

        $this->assertSame(16, strlen($token));
    }

    public function testGenerateNumericOnly(): void
    {
        $token = TokenGenerator::generate(
            numeric: true,
            majuscule: false,
            minuscule: false,
            symbols: false,
            length: 100,
        );

        $this->assertMatchesRegularExpression('/^\d+$/', $token);
    }

    public function testGenerateMajusculeOnly(): void
    {
        $token = TokenGenerator::generate(
            numeric: false,
            majuscule: true,
            minuscule: false,
            symbols: false,
            length: 100,
        );

        $this->assertMatchesRegularExpression('/^[A-Z]+$/', $token);
    }

    public function testGenerateMinusculeOnly(): void
    {
        $token = TokenGenerator::generate(
            numeric: false,
            majuscule: false,
            minuscule: true,
            symbols: false,
            length: 100,
        );

        $this->assertMatchesRegularExpression('/^[a-z]+$/', $token);
    }

    public function testGenerateWithoutSymbols(): void
    {
        $token = TokenGenerator::generate(
            numeric: true,
            majuscule: true,
            minuscule: true,
            symbols: false,
            length: 100,
        );

        $this->assertMatchesRegularExpression('/^[a-zA-Z0-9]+$/', $token);
    }

    public function testGenerateThrowsWhenNoCharacterSetEnabled(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        TokenGenerator::generate(
            numeric: false,
            majuscule: false,
            minuscule: false,
            symbols: false,
        );
    }

    public function testGeneratePublicIdDefaultLength(): void
    {
        $publicId = TokenGenerator::generatePublicId();

        $this->assertSame(12, strlen($publicId));
    }

    public function testGeneratePublicIdCustomLength(): void
    {
        $publicId = TokenGenerator::generatePublicId(length: 8);

        $this->assertSame(8, strlen($publicId));
    }

    public function testGeneratePublicIdContainsOnlyAllowedCharacters(): void
    {
        // Run multiple times to increase confidence
        for ($i = 0; $i < 50; $i++) {
            $publicId = TokenGenerator::generatePublicId();
            // Allowed chars: abcdefghjkmnpqrstuvwxyz23456789 (no i, l, o, 0, 1)
            $this->assertMatchesRegularExpression('/^[abcdefghjkmnpqrstuvwxyz23456789]+$/', $publicId);
        }
    }

    public function testGeneratePublicIdExcludesAmbiguousCharacters(): void
    {
        // Generate many IDs and verify none contain ambiguous chars
        $allIds = '';
        for ($i = 0; $i < 100; $i++) {
            $allIds .= TokenGenerator::generatePublicId(length: 30);
        }

        $this->assertStringNotContainsString('i', $allIds);
        $this->assertStringNotContainsString('l', $allIds);
        $this->assertStringNotContainsString('o', $allIds);
        $this->assertStringNotContainsString('0', $allIds);
        $this->assertStringNotContainsString('1', $allIds);
    }

    public function testGenerateTokenInstance(): void
    {
        $generator = new TokenGenerator(256);
        $token = $generator->generateToken();

        $this->assertNotEmpty($token);
        // Base64url encoded: 256/8 = 32 bytes → ~43 base64 chars (trimmed)
        $this->assertGreaterThan(30, strlen($token));
    }
}

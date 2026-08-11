<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests;

use Bangkeut\Tap\Assertion\AssertionCodec;
use Bangkeut\Tap\Assertion\DeviceAssertion;
use Bangkeut\Tap\Assertion\IssuedPassAssertion;
use Bangkeut\Tap\Exception\MalformedAssertion;
use Bangkeut\Tap\Exception\UnsupportedProtocolVersion;
use Bangkeut\Tap\Tap;
use PHPUnit\Framework\TestCase;

/**
 * The wire format is a contract with device and issuer SDKs that will be written separately, so the
 * byte layout is pinned here rather than left to whatever the encoder happens to emit.
 */
class AssertionCodecTest extends TestCase
{
    private AssertionCodec $codec;

    protected function setUp(): void
    {
        $this->codec = new AssertionCodec();
    }

    public function testADeviceAssertionRoundTrips(): void
    {
        $signature = random_bytes(64);
        $bytes = $this->codec->encodeDevice('abc123def456', 1786000000, $signature);

        $this->assertSame(Tap::DEVICE_ASSERTION_LENGTH, strlen($bytes));
        $this->assertSame(0x01, ord($bytes[0]), 'version byte');
        $this->assertSame(0x01, ord($bytes[1]), 'kind byte');

        $decoded = $this->codec->decode($bytes);
        $this->assertInstanceOf(DeviceAssertion::class, $decoded);
        $this->assertSame('abc123def456', $decoded->holderId);
        $this->assertSame(1786000000, $decoded->tappedAt);
        $this->assertSame($signature, $decoded->signature());
    }

    public function testAnIssuedPassRoundTrips(): void
    {
        $signature = random_bytes(64);
        $bytes = $this->codec->encodeIssuedPass('pass11223344', 'amcham0926ex', 1790000000, 1790086400, $signature);

        $this->assertSame(Tap::ISSUED_PASS_LENGTH, strlen($bytes));
        $this->assertSame(0x02, ord($bytes[1]), 'kind byte');

        $decoded = $this->codec->decode($bytes);
        $this->assertInstanceOf(IssuedPassAssertion::class, $decoded);
        $this->assertSame('pass11223344', $decoded->passId);
        $this->assertSame('amcham0926ex', $decoded->audienceId);
        $this->assertSame(1790000000, $decoded->notBefore);
        $this->assertSame(1790086400, $decoded->notAfter);
    }

    public function testSignedBytesAreDomainSeparatedByKind(): void
    {
        // A device assertion and a pass must never produce the same signing input, or a signature
        // harvested from one flow could be presented in the other.
        $device = $this->codec->deviceSignedBytes('nonce-bytes', 'gate-a', 'abc123def456', 1786000000);
        $pass = $this->codec->issuedPassSignedBytes('abc123def456', 'amcham0926ex', 1786000000, 1786086400);

        $this->assertStringStartsWith(Tap::MAGIC."\x01", $device);
        $this->assertStringStartsWith(Tap::MAGIC."\x02", $pass);
        $this->assertNotSame($device, $pass);
    }

    public function testNonceAndTerminalIdCannotBeReCutIntoADifferentPair(): void
    {
        // Without length prefixes these two would hash identically.
        $a = $this->codec->deviceSignedBytes('AB', 'CD', 'abc123def456', 1786000000);
        $b = $this->codec->deviceSignedBytes('ABC', 'D', 'abc123def456', 1786000000);

        $this->assertNotSame($a, $b);
    }

    public function testAnUnknownVersionIsRejectedRatherThanGuessed(): void
    {
        $bytes = $this->codec->encodeDevice('abc123def456', 1786000000, random_bytes(64));
        $bytes[0] = chr(0x09);

        $this->expectException(UnsupportedProtocolVersion::class);
        $this->codec->decode($bytes);
    }

    public function testAnUnknownKindIsRejected(): void
    {
        $bytes = $this->codec->encodeDevice('abc123def456', 1786000000, random_bytes(64));
        $bytes[1] = chr(0x7F);

        $this->expectException(MalformedAssertion::class);
        $this->codec->decode($bytes);
    }

    public function testATruncatedAssertionIsRejected(): void
    {
        $bytes = $this->codec->encodeDevice('abc123def456', 1786000000, random_bytes(64));

        $this->expectException(MalformedAssertion::class);
        $this->codec->decode(substr($bytes, 0, -1));
    }

    public function testTrailingBytesAreRejected(): void
    {
        $bytes = $this->codec->encodeDevice('abc123def456', 1786000000, random_bytes(64));

        $this->expectException(MalformedAssertion::class);
        $this->codec->decode($bytes."\x00");
    }

    public function testAWrongLengthIdentifierIsRefusedAtEncodeTime(): void
    {
        $this->expectException(MalformedAssertion::class);
        $this->codec->encodeDevice('too-short', 1786000000, random_bytes(64));
    }

    public function testBase64UrlIsUnpaddedAndRoundTrips(): void
    {
        $bytes = $this->codec->encodeDevice('abc123def456', 1786000000, random_bytes(64));
        $encoded = $this->codec->toBase64Url($bytes);

        $this->assertStringNotContainsString('=', $encoded);
        $this->assertStringNotContainsString('+', $encoded);
        $this->assertStringNotContainsString('/', $encoded);
        $this->assertSame($bytes, $this->codec->fromBase64Url($encoded));
    }
}

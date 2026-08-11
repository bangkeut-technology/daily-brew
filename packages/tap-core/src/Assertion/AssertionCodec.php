<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Assertion;

use Bangkeut\Tap\Exception\MalformedAssertion;
use Bangkeut\Tap\Exception\UnsupportedProtocolVersion;
use Bangkeut\Tap\Tap;

/**
 * The wire format, in one place. Encoders exist so tests — and the device/issuer SDKs that will be
 * written against this — have one authoritative implementation to check themselves against.
 *
 * Decoding is strict: exact lengths, known version, known kind. A tap that doesn't parse is a
 * rejected tap, never a best-effort guess.
 */
final class AssertionCodec
{
    public function decode(string $bytes): Assertion
    {
        if (strlen($bytes) < 2) {
            throw new MalformedAssertion('Assertion is shorter than its own header.');
        }

        $version = ord($bytes[0]);
        if ($version !== Tap::VERSION_1) {
            throw new UnsupportedProtocolVersion(sprintf('Unsupported protocol version 0x%02X.', $version));
        }

        $kind = AssertionKind::tryFrom(ord($bytes[1]));
        if ($kind === null) {
            throw new MalformedAssertion(sprintf('Unknown assertion kind 0x%02X.', ord($bytes[1])));
        }

        return match ($kind) {
            AssertionKind::DeviceAssertion => $this->decodeDevice($bytes),
            AssertionKind::IssuedPass => $this->decodeIssuedPass($bytes),
        };
    }

    public function encodeDevice(string $holderId, int $tappedAt, string $signature): string
    {
        return chr(Tap::VERSION_1)
            .chr(AssertionKind::DeviceAssertion->value)
            .$this->packId($holderId, 'holderId')
            .pack('N', $tappedAt)
            .$this->packSignature($signature);
    }

    public function encodeIssuedPass(
        string $passId,
        string $audienceId,
        int $notBefore,
        int $notAfter,
        string $signature,
    ): string {
        return chr(Tap::VERSION_1)
            .chr(AssertionKind::IssuedPass->value)
            .$this->packId($passId, 'passId')
            .$this->packId($audienceId, 'audienceId')
            .pack('N', $notBefore)
            .pack('N', $notAfter)
            .$this->packSignature($signature);
    }

    /**
     * The bytes a device signs. Built identically on both sides and never transmitted — if the two
     * implementations disagree by one byte, verification fails closed.
     */
    public function deviceSignedBytes(string $nonce, string $terminalId, string $holderId, int $tappedAt): string
    {
        return Tap::MAGIC
            .chr(AssertionKind::DeviceAssertion->value)
            .$this->lengthPrefixed($nonce, 'nonce')
            .$this->lengthPrefixed($terminalId, 'terminalId')
            .$this->packId($holderId, 'holderId')
            .pack('N', $tappedAt);
    }

    /** The bytes an issuer signs, once, when the pass is minted. */
    public function issuedPassSignedBytes(
        string $passId,
        string $audienceId,
        int $notBefore,
        int $notAfter,
    ): string {
        return Tap::MAGIC
            .chr(AssertionKind::IssuedPass->value)
            .$this->packId($passId, 'passId')
            .$this->packId($audienceId, 'audienceId')
            .pack('N', $notBefore)
            .pack('N', $notAfter);
    }

    /** Base64url, unpadded — for barcodes and JSON bodies. NFC carries the raw bytes instead. */
    public function toBase64Url(string $bytes): string
    {
        return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
    }

    public function fromBase64Url(string $encoded): string
    {
        $decoded = base64_decode(strtr($encoded, '-_', '+/'), true);
        if ($decoded === false) {
            throw new MalformedAssertion('Assertion is not valid base64url.');
        }

        return $decoded;
    }

    private function decodeDevice(string $bytes): DeviceAssertion
    {
        $this->assertLength($bytes, Tap::DEVICE_ASSERTION_LENGTH, 'device assertion');

        /** @var array{tappedAt: int} $time */
        $time = unpack('NtappedAt', substr($bytes, 14, 4));

        return new DeviceAssertion(
            holderId: substr($bytes, 2, Tap::ID_LENGTH),
            tappedAt: $time['tappedAt'],
            signature: substr($bytes, 18, Tap::SIGNATURE_LENGTH),
        );
    }

    private function decodeIssuedPass(string $bytes): IssuedPassAssertion
    {
        $this->assertLength($bytes, Tap::ISSUED_PASS_LENGTH, 'issued pass');

        /** @var array{notBefore: int, notAfter: int} $window */
        $window = unpack('NnotBefore/NnotAfter', substr($bytes, 26, 8));

        return new IssuedPassAssertion(
            passId: substr($bytes, 2, Tap::ID_LENGTH),
            audienceId: substr($bytes, 14, Tap::ID_LENGTH),
            notBefore: $window['notBefore'],
            notAfter: $window['notAfter'],
            signature: substr($bytes, 34, Tap::SIGNATURE_LENGTH),
        );
    }

    private function assertLength(string $bytes, int $expected, string $label): void
    {
        if (strlen($bytes) !== $expected) {
            throw new MalformedAssertion(sprintf(
                'A %s is %d bytes, got %d.',
                $label,
                $expected,
                strlen($bytes),
            ));
        }
    }

    private function packId(string $id, string $field): string
    {
        if (strlen($id) !== Tap::ID_LENGTH) {
            throw new MalformedAssertion(sprintf(
                '%s must be exactly %d bytes, got %d.',
                $field,
                Tap::ID_LENGTH,
                strlen($id),
            ));
        }

        return $id;
    }

    private function packSignature(string $signature): string
    {
        if (strlen($signature) !== Tap::SIGNATURE_LENGTH) {
            throw new MalformedAssertion(sprintf(
                'Signature must be exactly %d bytes (raw r ‖ s), got %d.',
                Tap::SIGNATURE_LENGTH,
                strlen($signature),
            ));
        }

        return $signature;
    }

    /**
     * Length-prefixed so that a nonce ending in the first byte of a terminal id can't be re-cut into
     * a different (nonce, terminalId) pair that hashes the same.
     */
    private function lengthPrefixed(string $value, string $field): string
    {
        $length = strlen($value);
        if ($length < 1 || $length > 255) {
            throw new MalformedAssertion(sprintf('%s must be 1..255 bytes, got %d.', $field, $length));
        }

        return chr($length).$value;
    }
}

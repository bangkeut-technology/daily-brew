<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Integration;

use App\Service\Integration\SecretCipher;
use PHPUnit\Framework\TestCase;

class SecretCipherTest extends TestCase
{
    private static function key(): string
    {
        return base64_encode(str_repeat("\x01", SODIUM_CRYPTO_SECRETBOX_KEYBYTES));
    }

    public function testRoundTrips(): void
    {
        $cipher = new SecretCipher(self::key(), '');

        $this->assertSame('dbs_secret', $cipher->decrypt($cipher->encrypt('dbs_secret')));
    }

    public function testSamePlaintextEncryptsDifferentlyEachTime(): void
    {
        $cipher = new SecretCipher(self::key(), '');

        // A fresh nonce per call: two tokens holding the same secret must not be
        // recognisable as such from the stored ciphertext.
        $this->assertNotSame($cipher->encrypt('same'), $cipher->encrypt('same'));
    }

    public function testTamperedCiphertextIsRejectedRatherThanDecrypted(): void
    {
        $cipher = new SecretCipher(self::key(), '');
        $encoded = $cipher->encrypt('dbs_secret');

        $raw = base64_decode($encoded, true);
        $raw[strlen($raw) - 1] = $raw[strlen($raw) - 1] === "\x00" ? "\x01" : "\x00";

        $this->expectException(\RuntimeException::class);
        // Authenticated encryption: a flipped bit fails the tag instead of
        // yielding garbage that would then be used as an HMAC key.
        $cipher->decrypt(base64_encode($raw));
    }

    public function testSecretEncryptedUnderADifferentKeyDoesNotDecrypt(): void
    {
        $encoded = (new SecretCipher(self::key(), ''))->encrypt('dbs_secret');
        $other = new SecretCipher(base64_encode(str_repeat("\x02", SODIUM_CRYPTO_SECRETBOX_KEYBYTES)), '');

        $this->expectException(\RuntimeException::class);
        $other->decrypt($encoded);
    }

    public function testGarbagePayloadIsRejected(): void
    {
        $cipher = new SecretCipher(self::key(), '');

        $this->expectException(\RuntimeException::class);
        $cipher->decrypt('not-base64-and-far-too-short');
    }

    public function testWrongSizedKeyIsRejectedAtConstruction(): void
    {
        $this->expectException(\LogicException::class);
        new SecretCipher(base64_encode('too-short'), '');
    }

    public function testFallsBackToAKeyDerivedFromAppSecret(): void
    {
        $a = new SecretCipher('', 'app-secret-value');
        $b = new SecretCipher('', 'app-secret-value');

        // Deterministic across instances, or nothing encrypted before a restart
        // could ever be read again.
        $this->assertSame('dbs_secret', $b->decrypt($a->encrypt('dbs_secret')));
    }

    public function testADifferentAppSecretDerivesADifferentKey(): void
    {
        $encoded = (new SecretCipher('', 'app-secret-value'))->encrypt('dbs_secret');

        $this->expectException(\RuntimeException::class);
        // Rotating APP_SECRET invalidates every stored signing secret. That's the
        // documented trade-off of not provisioning a dedicated key.
        (new SecretCipher('', 'rotated-app-secret'))->decrypt($encoded);
    }

    public function testRefusesToWorkWithNoKeyMaterialAtAll(): void
    {
        $this->expectException(\LogicException::class);
        new SecretCipher('', '');
    }
}

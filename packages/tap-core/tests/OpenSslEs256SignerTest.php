<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests;

use Bangkeut\Tap\Exception\SigningFailed;
use Bangkeut\Tap\Signature\Es256KeyPair;
use Bangkeut\Tap\Signature\OpenSslEs256Signer;
use Bangkeut\Tap\Signature\OpenSslEs256Verifier;
use Bangkeut\Tap\Tap;
use PHPUnit\Framework\TestCase;

/**
 * The DER ↔ raw conversion either side of the wire. It is the one piece of this library where a
 * bug is invisible most of the time: ECDSA's r and s are only short of 32 bytes about 1 in 256
 * signatures each, so a padding mistake produces a verifier that works until the day it doesn't.
 */
class OpenSslEs256SignerTest extends TestCase
{
    private OpenSslEs256Signer $signer;
    private OpenSslEs256Verifier $verifier;
    private Es256KeyPair $keys;

    protected function setUp(): void
    {
        $this->signer = new OpenSslEs256Signer();
        $this->verifier = new OpenSslEs256Verifier();
        $this->keys = Es256KeyPair::generate();
    }

    public function testASignatureVerifiesAgainstTheMatchingPublicKey(): void
    {
        $signature = $this->signer->sign('BKTAP1 hello', $this->keys->privateKeyPem);

        $this->assertTrue($this->verifier->verify('BKTAP1 hello', $signature, $this->keys->publicKeyPem));
    }

    public function testEverySignatureIsExactlyTheWireLength(): void
    {
        // Enough iterations to hit the short-r / short-s cases that a naive DER strip would
        // produce 63- or 62-byte signatures for.
        for ($i = 0; $i < 300; $i++) {
            $signature = $this->signer->sign('message '.$i, $this->keys->privateKeyPem);

            $this->assertSame(Tap::SIGNATURE_LENGTH, strlen($signature), 'iteration '.$i);
            $this->assertTrue(
                $this->verifier->verify('message '.$i, $signature, $this->keys->publicKeyPem),
                'iteration '.$i,
            );
        }
    }

    public function testADifferentMessageDoesNotVerify(): void
    {
        $signature = $this->signer->sign('the signed bytes', $this->keys->privateKeyPem);

        $this->assertFalse($this->verifier->verify('the signed bytes.', $signature, $this->keys->publicKeyPem));
    }

    public function testADifferentKeyDoesNotVerify(): void
    {
        $signature = $this->signer->sign('the signed bytes', $this->keys->privateKeyPem);

        $this->assertFalse(
            $this->verifier->verify('the signed bytes', $signature, Es256KeyPair::generate()->publicKeyPem),
        );
    }

    public function testAnUnreadableKeyIsRefused(): void
    {
        $this->expectException(SigningFailed::class);
        $this->expectExceptionMessage('Could not read the issuer private key.');

        $this->signer->sign('anything', 'not a pem');
    }

    public function testANonEcKeyIsRefused(): void
    {
        $rsa = openssl_pkey_new(['private_key_type' => OPENSSL_KEYTYPE_RSA, 'private_key_bits' => 2048]);
        self::assertNotFalse($rsa);
        openssl_pkey_export($rsa, $rsaPem);

        $this->expectException(SigningFailed::class);
        $this->expectExceptionMessage('not an EC key');

        $this->signer->sign('anything', $rsaPem);
    }

    public function testAKeyOnTheWrongCurveIsRefused(): void
    {
        $p384 = openssl_pkey_new(['private_key_type' => OPENSSL_KEYTYPE_EC, 'curve_name' => 'secp384r1']);
        self::assertNotFalse($p384);
        openssl_pkey_export($p384, $p384Pem);

        // P-384 signs happily and produces 96 bytes, which the wire format cannot carry. Catching
        // it here beats discovering it as a length mismatch inside the codec.
        $this->expectException(SigningFailed::class);
        $this->expectExceptionMessage('P-256');

        $this->signer->sign('anything', $p384Pem);
    }

    public function testGeneratingAKeyPairProducesAUsablePairInBothDirections(): void
    {
        $keys = Es256KeyPair::generate();

        $this->assertStringContainsString('PRIVATE KEY', $keys->privateKeyPem);
        $this->assertStringContainsString('PUBLIC KEY', $keys->publicKeyPem);
        $this->assertTrue($this->verifier->verify(
            'round trip',
            $this->signer->sign('round trip', $keys->privateKeyPem),
            $keys->publicKeyPem,
        ));
    }

    public function testAKeyPairCannotBeBuiltFromSomethingThatIsNotAKey(): void
    {
        $this->expectException(SigningFailed::class);

        Es256KeyPair::fromPrivateKeyPem('-----BEGIN PRIVATE KEY-----\nnope\n-----END PRIVATE KEY-----');
    }
}

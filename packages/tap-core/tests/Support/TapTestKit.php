<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests\Support;

use Bangkeut\Tap\Signature\Es256KeyPair;
use Bangkeut\Tap\Signature\OpenSslEs256Signer;

/**
 * Stands in for a holder's device, which in production is Android Keystore or a Secure Enclave and
 * has no PHP equivalent. The issuer side is no longer simulated here — {@see \Bangkeut\Tap\Issuance\PassIssuer}
 * is the real thing, and tests that mint passes use it.
 */
final class TapTestKit
{
    /** @return array{0: string, 1: string} [privateKeyPem, publicKeyPem] */
    public static function keyPair(): array
    {
        $keys = Es256KeyPair::generate();

        return [$keys->privateKeyPem, $keys->publicKeyPem];
    }

    /** Signs and returns the raw 64-byte r ‖ s the wire format carries. */
    public static function sign(string $message, string $privateKeyPem): string
    {
        return (new OpenSslEs256Signer())->sign($message, $privateKeyPem);
    }
}

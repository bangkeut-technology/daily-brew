<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Signature;

use Bangkeut\Tap\Exception\SigningFailed;

/**
 * A P-256 key pair for an issuer.
 *
 * The private half signs passes at issuance and never leaves the issuer; the public half is what
 * terminals hold, so it is the value that goes into an {@see \Bangkeut\Tap\Credential\IssuerKeyStore}.
 * Rotation is why that store returns several keys: mint with the new key, keep publishing the old
 * one until the passes signed with it have expired from people's wallets.
 */
final readonly class Es256KeyPair
{
    private function __construct(
        public string $privateKeyPem,
        /** PEM SubjectPublicKeyInfo — the exact string the verifier side expects. */
        public string $publicKeyPem,
    ) {
    }

    public static function generate(): self
    {
        $key = openssl_pkey_new([
            'private_key_type' => OPENSSL_KEYTYPE_EC,
            'curve_name' => 'prime256v1',
        ]);
        if ($key === false) {
            throw new SigningFailed('Could not generate a P-256 key pair.');
        }

        if (!openssl_pkey_export($key, $privatePem)) {
            throw new SigningFailed('Could not export the generated private key.');
        }

        return new self($privatePem, self::publicKeyOf($key));
    }

    /**
     * Derives the public half from a stored private key — the shape an issuer needs when it loads
     * its key from a secret store and has to publish the matching public key to a terminal.
     */
    public static function fromPrivateKeyPem(string $privateKeyPem): self
    {
        $key = openssl_pkey_get_private($privateKeyPem);
        if ($key === false) {
            throw new SigningFailed('Could not read the private key.');
        }

        return new self($privateKeyPem, self::publicKeyOf($key));
    }

    private static function publicKeyOf(\OpenSSLAsymmetricKey $key): string
    {
        $details = openssl_pkey_get_details($key);
        if ($details === false || !isset($details['key'])) {
            throw new SigningFailed('Could not read the public half of the key.');
        }
        if (($details['type'] ?? null) !== OPENSSL_KEYTYPE_EC
            || ($details['ec']['curve_name'] ?? null) !== 'prime256v1') {
            throw new SigningFailed('Issuer keys must be EC keys on the P-256 curve (prime256v1).');
        }

        return $details['key'];
    }
}

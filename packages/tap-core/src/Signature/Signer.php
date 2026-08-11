<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Signature;

/**
 * The issuing counterpart to {@see SignatureVerifier}.
 *
 * Only the issuer side of the protocol needs this: a holder's device signs with its own keystore
 * (Android Keystore, Secure Enclave, WebCrypto) and never hands a private key to PHP.
 */
interface Signer
{
    /**
     * @param string $message       the exact bytes to sign
     * @param string $privateKeyPem PEM-encoded P-256 private key
     *
     * @return string 64-byte raw r ‖ s, the shape the wire format carries
     *
     * @throws \Bangkeut\Tap\Exception\SigningFailed when the key is unusable or OpenSSL refuses
     */
    public function sign(string $message, string $privateKeyPem): string;
}

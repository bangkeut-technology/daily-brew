<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Signature;

/**
 * ECDSA P-256 / SHA-256 via ext-openssl.
 *
 * The wire carries the raw 64-byte r ‖ s that Android Keystore, WebCrypto and every other JOSE-ish
 * stack produces; OpenSSL wants DER, so the conversion lives here and nowhere else.
 */
final class OpenSslEs256Verifier implements SignatureVerifier
{
    public function verify(string $message, string $rawSignature, string $publicKeyPem): bool
    {
        if (strlen($rawSignature) !== 64) {
            return false;
        }

        $key = openssl_pkey_get_public($publicKeyPem);
        if ($key === false) {
            // A malformed stored key is a rejected tap, not an exception — one bad row must not
            // stop the verifier from trying the holder's other credentials.
            return false;
        }

        $details = openssl_pkey_get_details($key);
        if (($details['type'] ?? null) !== OPENSSL_KEYTYPE_EC) {
            return false;
        }

        return openssl_verify($message, $this->rawToDer($rawSignature), $key, OPENSSL_ALGO_SHA256) === 1;
    }

    /** r ‖ s → SEQUENCE { INTEGER r, INTEGER s }. Both halves are 32 bytes on P-256. */
    private function rawToDer(string $raw): string
    {
        $r = $this->toDerInteger(substr($raw, 0, 32));
        $s = $this->toDerInteger(substr($raw, 32, 32));
        $sequence = $r.$s;

        // A P-256 signature never reaches 128 bytes, so short-form length is always correct here.
        return "\x30".chr(strlen($sequence)).$sequence;
    }

    private function toDerInteger(string $value): string
    {
        $value = ltrim($value, "\x00");
        if ($value === '') {
            $value = "\x00";
        }
        // DER integers are signed: a leading bit of 1 would read as negative, so pad it.
        if ((ord($value[0]) & 0x80) !== 0) {
            $value = "\x00".$value;
        }

        return "\x02".chr(strlen($value)).$value;
    }
}

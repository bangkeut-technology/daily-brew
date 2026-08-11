<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Signature;

use Bangkeut\Tap\Exception\SigningFailed;

/**
 * ECDSA P-256 / SHA-256 via ext-openssl — the mirror of {@see OpenSslEs256Verifier}.
 *
 * OpenSSL emits DER; the wire carries raw r ‖ s. The conversion in each direction lives in exactly
 * one place: raw → DER in the verifier, DER → raw here.
 */
final class OpenSslEs256Signer implements Signer
{
    public function sign(string $message, string $privateKeyPem): string
    {
        $key = openssl_pkey_get_private($privateKeyPem);
        if ($key === false) {
            throw new SigningFailed('Could not read the issuer private key.');
        }

        $details = openssl_pkey_get_details($key);
        if (($details['type'] ?? null) !== OPENSSL_KEYTYPE_EC) {
            throw new SigningFailed('The issuer key is not an EC key.');
        }
        // A P-384 key would sign happily and produce 96 bytes the wire format can't carry, so the
        // curve is checked here rather than discovered as a length error further downstream.
        if (($details['ec']['curve_name'] ?? null) !== 'prime256v1') {
            throw new SigningFailed('The issuer key must be on the P-256 curve (prime256v1).');
        }

        if (!openssl_sign($message, $der, $key, OPENSSL_ALGO_SHA256)) {
            throw new SigningFailed('OpenSSL refused to sign with this key.');
        }

        return $this->derToRaw($der);
    }

    /** SEQUENCE { INTEGER r, INTEGER s } → r ‖ s, each half left-padded to 32 bytes. */
    private function derToRaw(string $der): string
    {
        $offset = 0;
        if (($der[$offset] ?? '') !== "\x30") {
            throw new SigningFailed('OpenSSL produced a signature that is not a DER SEQUENCE.');
        }
        $offset += 2; // SEQUENCE tag + length — always short-form for P-256.

        $r = $this->readInteger($der, $offset);
        $s = $this->readInteger($der, $offset);

        return $this->pad($r).$this->pad($s);
    }

    private function readInteger(string $der, int &$offset): string
    {
        if (($der[$offset] ?? '') !== "\x02") {
            throw new SigningFailed('Malformed DER signature: expected an INTEGER.');
        }
        $offset++;

        $length = ord($der[$offset] ?? "\x00");
        $offset++;

        $value = substr($der, $offset, $length);
        $offset += $length;

        // DER integers are signed, so a value whose top bit is set carries a leading 0x00 that is
        // padding, not magnitude. The raw format is unsigned and fixed-width, so it comes back off.
        return ltrim($value, "\x00");
    }

    private function pad(string $value): string
    {
        if (strlen($value) > 32) {
            throw new SigningFailed('Signature component is larger than P-256 allows.');
        }

        return str_pad($value, 32, "\x00", STR_PAD_LEFT);
    }
}

<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests\Support;

/**
 * A real P-256 signer for the tests. Deliberately dependency-free, like the doubles beside it: this
 * package is meant to be liftable into its own repository, so its tests can't lean on the host
 * application's toolbox.
 */
final class TapTestKit
{
    /** @return array{0: string, 1: string} [privateKeyPem, publicKeyPem] */
    public static function keyPair(): array
    {
        $key = openssl_pkey_new([
            'private_key_type' => OPENSSL_KEYTYPE_EC,
            'curve_name' => 'prime256v1',
        ]);
        if ($key === false) {
            throw new \RuntimeException('Could not generate a P-256 key pair.');
        }

        openssl_pkey_export($key, $privatePem);
        $details = openssl_pkey_get_details($key);

        return [$privatePem, $details['key']];
    }

    /** Signs and returns the raw 64-byte r ‖ s the wire format carries. */
    public static function sign(string $message, string $privateKeyPem): string
    {
        openssl_sign($message, $der, $privateKeyPem, OPENSSL_ALGO_SHA256);

        return self::derToRaw($der);
    }

    private static function derToRaw(string $der): string
    {
        $offset = 2; // SEQUENCE tag + length (always short-form for P-256)
        $r = self::readInteger($der, $offset);
        $s = self::readInteger($der, $offset);

        return str_pad($r, 32, "\x00", STR_PAD_LEFT).str_pad($s, 32, "\x00", STR_PAD_LEFT);
    }

    private static function readInteger(string $der, int &$offset): string
    {
        $offset++; // INTEGER tag
        $length = ord($der[$offset++]);
        $value = substr($der, $offset, $length);
        $offset += $length;

        return ltrim($value, "\x00");
    }
}

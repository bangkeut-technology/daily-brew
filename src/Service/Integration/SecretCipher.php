<?php

declare(strict_types=1);

namespace App\Service\Integration;

/**
 * Symmetric encryption for secrets the server has to be able to read back.
 *
 * API tokens themselves are hashed, never encrypted — the server only ever
 * needs to recognise one, so a digest is strictly safer. A signing secret is
 * different: verifying an HMAC means recomputing it, which means holding the
 * key. Encrypting it is the best available answer — a database dump alone
 * yields nothing, because the key lives in the environment, not the database.
 *
 * XSalsa20-Poly1305 via sodium_crypto_secretbox: authenticated, so a tampered
 * ciphertext fails loudly rather than decrypting to garbage that then gets used
 * as an HMAC key.
 */
final class SecretCipher
{
    /**
     * Derivation context. Changing this string invalidates every stored secret,
     * which is a rotation mechanism, not a knob to turn casually.
     */
    private const string HKDF_INFO = 'dailybrew-api-token-secret-v1';

    private string $key;

    public function __construct(string $encryptionKey, string $appSecret)
    {
        if ($encryptionKey !== '') {
            $decoded = base64_decode($encryptionKey, true);
            if ($decoded === false || strlen($decoded) !== SODIUM_CRYPTO_SECRETBOX_KEYBYTES) {
                throw new \LogicException(sprintf(
                    'API_TOKEN_ENCRYPTION_KEY must be %d base64-encoded random bytes.',
                    SODIUM_CRYPTO_SECRETBOX_KEYBYTES,
                ));
            }
            $this->key = $decoded;

            return;
        }

        // No dedicated key provisioned: derive one from APP_SECRET so a fresh
        // deployment works without an extra step. The trade-off is real and
        // documented — rotating APP_SECRET invalidates every signing secret,
        // and the tokens have to be re-minted.
        if ($appSecret === '') {
            throw new \LogicException('Either API_TOKEN_ENCRYPTION_KEY or APP_SECRET must be set to store API signing secrets.');
        }

        $this->key = hash_hkdf('sha256', $appSecret, SODIUM_CRYPTO_SECRETBOX_KEYBYTES, self::HKDF_INFO);
    }

    /** @return string base64 of nonce || ciphertext, safe to put in a TEXT column */
    public function encrypt(string $plaintext): string
    {
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);

        return base64_encode($nonce.sodium_crypto_secretbox($plaintext, $nonce, $this->key));
    }

    /**
     * @throws \RuntimeException when the payload is malformed or fails its authentication tag —
     *                           both mean "do not use this as a key", so neither is recoverable
     */
    public function decrypt(string $encoded): string
    {
        $raw = base64_decode($encoded, true);
        if ($raw === false || strlen($raw) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) {
            throw new \RuntimeException('Stored secret is not a valid ciphertext.');
        }

        $nonce = substr($raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $cipher = substr($raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);

        $plain = sodium_crypto_secretbox_open($cipher, $nonce, $this->key);
        if ($plain === false) {
            throw new \RuntimeException('Stored secret failed authentication — wrong key or tampered row.');
        }

        return $plain;
    }
}

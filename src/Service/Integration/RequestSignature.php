<?php

declare(strict_types=1);

namespace App\Service\Integration;

/**
 * The signing scheme itself — no framework, no state, no I/O, so both sides of
 * the handshake can be reasoned about (and tested) in isolation.
 *
 * Signed string, newline-joined:
 *
 *     v1
 *     {timestamp}
 *     {nonce}
 *     {METHOD}
 *     {path}                    ← path only: no host, no query string
 *     {sha256(raw body) in hex}
 *
 * The body is hashed rather than embedded so the signing input stays bounded
 * and no canonical-JSON argument is ever needed: the client signs the exact
 * bytes it sends, the server verifies the exact bytes it received.
 */
final class RequestSignature
{
    public const string VERSION = 'v1';

    /** Header names, kept here so client docs and server code can't drift. */
    public const string HEADER_KEY_ID = 'X-DB-Key-Id';
    public const string HEADER_TIMESTAMP = 'X-DB-Timestamp';
    public const string HEADER_NONCE = 'X-DB-Nonce';
    public const string HEADER_SIGNATURE = 'X-DB-Signature';

    /** Shortest nonce we'll accept. Long enough that honest clients can't collide by accident. */
    public const int MIN_NONCE_LENGTH = 16;

    public static function canonicalString(
        int $timestamp,
        string $nonce,
        string $method,
        string $path,
        string $body,
    ): string {
        return implode("\n", [
            self::VERSION,
            (string) $timestamp,
            $nonce,
            strtoupper($method),
            $path,
            hash('sha256', $body),
        ]);
    }

    /** @return string the full header value, e.g. "v1=6b1e…c4" */
    public static function sign(
        string $secret,
        int $timestamp,
        string $nonce,
        string $method,
        string $path,
        string $body,
    ): string {
        $mac = hash_hmac('sha256', self::canonicalString($timestamp, $nonce, $method, $path, $body), $secret);

        return self::VERSION.'='.$mac;
    }

    /**
     * Constant-time comparison of a caller-supplied header against the expected
     * signature. A `===` here would leak the correct MAC one byte at a time.
     */
    public static function matches(string $expected, string $provided): bool
    {
        return hash_equals($expected, $provided);
    }
}

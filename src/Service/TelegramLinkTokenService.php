<?php

declare(strict_types=1);

namespace App\Service;

/**
 * Issues and verifies short-lived signed tokens used in the Telegram /start
 * deep-link flow.
 *
 * Workspace tokens (legacy):
 *     payload  = <workspacePublicId>.<expiresAtUnix>
 *     token    = base64url(payload . '.' . hmac(payload))
 *
 * User tokens (new):
 *     payload  = 'user:<userPublicId>.<expiresAtUnix>'
 *     token    = base64url(payload . '.' . hmac(payload))
 *
 * The `user:` prefix is inside the signed payload, so a workspace token cannot
 * be replayed as a user token (or vice versa) — the signature covers the
 * prefix. Workspace tokens stay prefix-less so existing in-flight links keep
 * working across the rollout.
 *
 * Signed with the app secret so a leaked link can't be forged for another
 * workspace/user, and constrained by a 10-minute expiry so a leaked link that's
 * already been used or sat in chat history can't be replayed.
 */
class TelegramLinkTokenService
{
    public const int DEFAULT_TTL_SECONDS = 600;
    private const string USER_PREFIX = 'user:';

    public function __construct(
        private readonly string $appSecret,
    ) {}

    // ── Workspace tokens ───────────────────────────────────────

    public function issue(string $workspacePublicId, int $ttlSeconds = self::DEFAULT_TTL_SECONDS): string
    {
        return $this->issueForSubject($workspacePublicId, $ttlSeconds);
    }

    /**
     * Verify a workspace token and return the workspace public ID, or null if
     * invalid/expired/forged/wrong-type. A user token is rejected here because
     * its payload starts with `user:` and we explicitly disallow that.
     */
    public function verify(string $token): ?string
    {
        $subject = $this->verifySubject($token);
        if ($subject === null) {
            return null;
        }
        // Reject user tokens trying to masquerade as workspace tokens.
        if (str_starts_with($subject, self::USER_PREFIX)) {
            return null;
        }
        return $subject;
    }

    // ── User tokens ────────────────────────────────────────────

    public function issueForUser(string $userPublicId, int $ttlSeconds = self::DEFAULT_TTL_SECONDS): string
    {
        return $this->issueForSubject(self::USER_PREFIX . $userPublicId, $ttlSeconds);
    }

    /**
     * Verify a user token and return the user public ID (without prefix), or
     * null if invalid/expired/forged/wrong-type. Workspace tokens are rejected
     * here because they lack the `user:` prefix.
     */
    public function verifyForUser(string $token): ?string
    {
        $subject = $this->verifySubject($token);
        if ($subject === null) {
            return null;
        }
        if (!str_starts_with($subject, self::USER_PREFIX)) {
            return null;
        }
        return substr($subject, strlen(self::USER_PREFIX));
    }

    // ── Shared signing / decoding ──────────────────────────────

    private function issueForSubject(string $subject, int $ttlSeconds): string
    {
        $expiresAt = time() + $ttlSeconds;
        $payload = $subject . '.' . $expiresAt;
        $signature = $this->sign($payload);

        return $this->base64UrlEncode($payload . '.' . $signature);
    }

    /**
     * Decode + signature-check + expiry-check. Returns the raw subject string
     * (may include the `user:` prefix) on success, null otherwise. Callers map
     * this onto a workspace or user via `verify()` / `verifyForUser()`.
     */
    private function verifySubject(string $token): ?string
    {
        $decoded = $this->base64UrlDecode($token);
        if ($decoded === null) {
            return null;
        }

        $parts = explode('.', $decoded);
        if (count($parts) !== 3) {
            return null;
        }

        [$subject, $expiresAt, $signature] = $parts;
        $expectedSignature = $this->sign($subject . '.' . $expiresAt);
        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        if ((int) $expiresAt < time()) {
            return null;
        }

        return $subject;
    }

    private function sign(string $payload): string
    {
        return hash_hmac('sha256', $payload, $this->appSecret);
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): ?string
    {
        $padded = str_pad(strtr($data, '-_', '+/'), strlen($data) + ((4 - strlen($data) % 4) % 4), '=');
        $decoded = base64_decode($padded, true);
        return $decoded === false ? null : $decoded;
    }
}

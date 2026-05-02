<?php

declare(strict_types=1);

namespace App\Service;

/**
 * Issues and verifies short-lived signed tokens used in the Telegram /start
 * deep-link flow. Format: base64url(workspacePublicId.expiresAtUnix.signature).
 *
 * Signed with the app secret so a leaked link can't be forged for another
 * workspace, and constrained by a 10-minute expiry so a leaked link that's
 * already been used or sat in chat history can't be replayed.
 */
class TelegramLinkTokenService
{
    private const int DEFAULT_TTL_SECONDS = 600;

    public function __construct(
        private readonly string $appSecret,
    ) {}

    public function issue(string $workspacePublicId, int $ttlSeconds = self::DEFAULT_TTL_SECONDS): string
    {
        $expiresAt = time() + $ttlSeconds;
        $payload = $workspacePublicId . '.' . $expiresAt;
        $signature = $this->sign($payload);

        return $this->base64UrlEncode($payload . '.' . $signature);
    }

    /**
     * Verify a token and return the workspace public ID, or null if invalid/expired.
     */
    public function verify(string $token): ?string
    {
        $decoded = $this->base64UrlDecode($token);
        if ($decoded === null) {
            return null;
        }

        $parts = explode('.', $decoded);
        if (count($parts) !== 3) {
            return null;
        }

        [$workspacePublicId, $expiresAt, $signature] = $parts;
        $expectedSignature = $this->sign($workspacePublicId . '.' . $expiresAt);
        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        if ((int) $expiresAt < time()) {
            return null;
        }

        return $workspacePublicId;
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

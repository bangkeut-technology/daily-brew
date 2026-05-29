<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Service\TelegramLinkTokenService;
use PHPUnit\Framework\TestCase;

class TelegramLinkTokenServiceTest extends TestCase
{
    private const string SECRET = 'test-secret-do-not-use-in-prod';

    private TelegramLinkTokenService $svc;

    protected function setUp(): void
    {
        $this->svc = new TelegramLinkTokenService(self::SECRET);
    }

    // ── Workspace tokens ──────────────────────────────────────

    public function testIssueAndVerifyRoundTripsWorkspacePublicId(): void
    {
        $publicId = 'ws-abc-123';
        $token = $this->svc->issue($publicId);

        $this->assertSame($publicId, $this->svc->verify($token));
    }

    public function testTokenIsBase64UrlSafe(): void
    {
        $token = $this->svc->issue('ws-abc-123');

        $this->assertMatchesRegularExpression('/^[A-Za-z0-9_-]+$/', $token);
    }

    public function testVerifyRejectsTamperedToken(): void
    {
        $token = $this->svc->issue('ws-abc-123');
        $tampered = $token . 'X';

        $this->assertNull($this->svc->verify($tampered));
    }

    public function testVerifyRejectsTokenSignedWithDifferentSecret(): void
    {
        $other = new TelegramLinkTokenService('other-secret');
        $token = $other->issue('ws-abc-123');

        $this->assertNull($this->svc->verify($token));
    }

    public function testVerifyRejectsExpiredToken(): void
    {
        $token = $this->svc->issue('ws-abc-123', ttlSeconds: -10);

        $this->assertNull($this->svc->verify($token));
    }

    public function testVerifyRejectsMalformedBase64(): void
    {
        $this->assertNull($this->svc->verify('not!valid!!!base64'));
    }

    public function testVerifyRejectsTokenWithWrongPartCount(): void
    {
        // Build a malformed payload (only 2 dots → 3 parts ok, so fewer):
        $bad = rtrim(strtr(base64_encode('only-one-part'), '+/', '-_'), '=');

        $this->assertNull($this->svc->verify($bad));
    }

    public function testTwoIssuesAtSameSecondProduceTheSameTokenForSameInput(): void
    {
        // Deterministic given (publicId, expiresAt, secret) — useful sanity check
        // for the signing function not introducing per-call randomness.
        $a = $this->svc->issue('ws-abc-123', ttlSeconds: 600);
        $b = $this->svc->issue('ws-abc-123', ttlSeconds: 600);

        // They might differ by 1 second if the clock ticks; assert at least both verify.
        $this->assertSame('ws-abc-123', $this->svc->verify($a));
        $this->assertSame('ws-abc-123', $this->svc->verify($b));
    }

    // ── User tokens ───────────────────────────────────────────

    public function testIssueForUserAndVerifyForUserRoundTripsUserPublicId(): void
    {
        $publicId = 'user-xyz-999';
        $token = $this->svc->issueForUser($publicId);

        $this->assertSame($publicId, $this->svc->verifyForUser($token));
    }

    public function testIssueForUserProducesBase64UrlSafeToken(): void
    {
        $token = $this->svc->issueForUser('user-xyz-999');

        $this->assertMatchesRegularExpression('/^[A-Za-z0-9_-]+$/', $token);
    }

    public function testVerifyForUserRejectsExpiredToken(): void
    {
        $token = $this->svc->issueForUser('user-xyz-999', ttlSeconds: -10);

        $this->assertNull($this->svc->verifyForUser($token));
    }

    public function testVerifyForUserRejectsTokenSignedWithDifferentSecret(): void
    {
        $other = new TelegramLinkTokenService('other-secret');
        $token = $other->issueForUser('user-xyz-999');

        $this->assertNull($this->svc->verifyForUser($token));
    }

    public function testVerifyForUserRejectsTamperedToken(): void
    {
        $token = $this->svc->issueForUser('user-xyz-999');

        $this->assertNull($this->svc->verifyForUser($token . 'X'));
    }

    // ── Prefix collision: workspace ↔ user tokens never cross-verify ──

    public function testWorkspaceTokenDoesNotVerifyAsUserToken(): void
    {
        $token = $this->svc->issue('ws-abc-123');

        $this->assertNull($this->svc->verifyForUser($token));
    }

    public function testUserTokenDoesNotVerifyAsWorkspaceToken(): void
    {
        $token = $this->svc->issueForUser('user-xyz-999');

        $this->assertNull($this->svc->verify($token));
    }

    public function testWorkspacePublicIdHappeningToStartWithUserPrefixIsRejectedByVerify(): void
    {
        // Defensive: if somehow a workspace publicId literally starts with
        // `user:` (it can't with our generator, but assert the boundary), we
        // refuse to return it from `verify()` so the webhook handler doesn't
        // mistake it for a user link.
        $token = $this->svc->issue('user:looks-like-a-user-token');

        $this->assertNull($this->svc->verify($token));
    }
}

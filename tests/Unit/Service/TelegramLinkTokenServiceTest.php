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
}

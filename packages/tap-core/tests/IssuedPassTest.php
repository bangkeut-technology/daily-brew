<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests;

use Bangkeut\Tap\Assertion\AssertionCodec;
use Bangkeut\Tap\Assertion\AssertionKind;
use Bangkeut\Tap\Exception\AudienceMismatch;
use Bangkeut\Tap\Exception\InvalidSignature;
use Bangkeut\Tap\Exception\PassExpired;
use Bangkeut\Tap\Exception\PassNotYetValid;
use Bangkeut\Tap\Exception\PassRecentlyUsed;
use Bangkeut\Tap\Exception\UnknownIssuer;
use Bangkeut\Tap\Signature\OpenSslEs256Verifier;
use Bangkeut\Tap\TapPolicy;
use Bangkeut\Tap\TapRequest;
use Bangkeut\Tap\TapVerifier;
use Bangkeut\Tap\Tests\Support\FrozenClock;
use Bangkeut\Tap\Tests\Support\InMemoryCredentialStore;
use Bangkeut\Tap\Tests\Support\InMemoryIssuerKeyStore;
use Bangkeut\Tap\Tests\Support\InMemoryNonceStore;
use Bangkeut\Tap\Tests\Support\TapTestKit;
use PHPUnit\Framework\TestCase;

/**
 * The conference-door half: a pass minted at ticket purchase, verified at the gate with no app on
 * the attendee's phone and no network at the terminal.
 */
class IssuedPassTest extends TestCase
{
    private const string PASS = 'pass11223344';
    private const string EVENT = 'amcham0926ex';
    private const string GATE = 'gate-hall-a';

    private AssertionCodec $codec;
    private FrozenClock $clock;
    private InMemoryIssuerKeyStore $issuerKeys;
    private InMemoryNonceStore $nonces;
    private string $issuerPrivateKey;

    protected function setUp(): void
    {
        $this->codec = new AssertionCodec();
        $this->clock = FrozenClock::at('2026-09-26 08:30:00');
        $this->issuerKeys = new InMemoryIssuerKeyStore();
        $this->nonces = new InMemoryNonceStore();

        [$this->issuerPrivateKey, $publicKey] = TapTestKit::keyPair();
        $this->issuerKeys->add(self::EVENT, $publicKey);
    }

    public function testAValidPassIsAdmitted(): void
    {
        $result = $this->verifier()->verify($this->request($this->pass()));

        $this->assertSame(AssertionKind::IssuedPass, $result->kind);
        $this->assertSame(self::PASS, $result->subjectId);
        $this->assertSame(self::EVENT, $result->audienceId);
        // Nothing device-bound about a pass — there is no credential to name.
        $this->assertNull($result->credential);
    }

    public function testAPassForAnotherEventIsRefusedEvenWhenTheSignatureIsGood(): void
    {
        $otherEvent = $this->pass(audienceId: 'eurocham0926');

        $this->expectException(AudienceMismatch::class);
        $this->verifier()->verify($this->request($otherEvent));
    }

    public function testATamperedValidityWindowBreaksTheSignature(): void
    {
        // Forge a pass that claims a longer validity than the issuer signed.
        $forged = $this->codec->encodeIssuedPass(
            self::PASS,
            self::EVENT,
            $this->clock->now()->getTimestamp() - 3600,
            $this->clock->now()->getTimestamp() + 86400 * 30,
            TapTestKit::sign(
                $this->codec->issuedPassSignedBytes(
                    self::PASS,
                    self::EVENT,
                    $this->clock->now()->getTimestamp() - 3600,
                    $this->clock->now()->getTimestamp() + 3600,
                ),
                $this->issuerPrivateKey,
            ),
        );

        $this->expectException(InvalidSignature::class);
        $this->verifier()->verify($this->request($forged));
    }

    public function testAPassPresentedBeforeDoorsOpenIsRefused(): void
    {
        $tomorrow = $this->pass(
            notBefore: $this->clock->now()->getTimestamp() + 86400,
            notAfter: $this->clock->now()->getTimestamp() + 86400 * 2,
        );

        $this->expectException(PassNotYetValid::class);
        $this->verifier()->verify($this->request($tomorrow));
    }

    public function testAPassPresentedAfterTheEventIsRefused(): void
    {
        $lastYear = $this->pass(
            notBefore: $this->clock->now()->getTimestamp() - 86400 * 400,
            notAfter: $this->clock->now()->getTimestamp() - 86400 * 399,
        );

        $this->expectException(PassExpired::class);
        $this->verifier()->verify($this->request($lastYear));
    }

    public function testAnEventWithNoIssuerKeyIsReportedAsSuchNotAsABadSignature(): void
    {
        $verifier = new TapVerifier(
            credentials: new InMemoryCredentialStore(),
            issuerKeys: new InMemoryIssuerKeyStore(),
            nonces: $this->nonces,
            signatures: new OpenSslEs256Verifier(),
            clock: $this->clock,
            codec: $this->codec,
        );

        $this->expectException(UnknownIssuer::class);
        $verifier->verify($this->request($this->pass()));
    }

    public function testARotatedIssuerKeyDoesNotInvalidatePassesAlreadyInWallets(): void
    {
        // Passes were minted with the old key; a new key has since been added.
        [$newPrivate, $newPublic] = TapTestKit::keyPair();
        $this->issuerKeys->add(self::EVENT, $newPublic);

        $oldKeyPass = $this->pass();
        $newKeyPass = $this->pass(privateKey: $newPrivate);

        $verifier = $this->verifier();
        $this->assertSame(self::PASS, $verifier->verify($this->request($oldKeyPass))->subjectId);
        $this->assertSame(self::PASS, $verifier->verify($this->request($newKeyPass))->subjectId);
    }

    public function testAntiPassbackBlocksTheSamePassTwiceAtTheSameGate(): void
    {
        $verifier = $this->verifier(new TapPolicy(passReuseCooldownSeconds: 60));
        $pass = $this->pass();

        $verifier->verify($this->request($pass));

        $this->expectException(PassRecentlyUsed::class);
        $verifier->verify($this->request($pass));
    }

    public function testWithoutACooldownReEntryIsAllowed(): void
    {
        $verifier = $this->verifier(new TapPolicy(passReuseCooldownSeconds: 0));
        $pass = $this->pass();

        $verifier->verify($this->request($pass));
        $result = $verifier->verify($this->request($pass));

        $this->assertSame(self::PASS, $result->subjectId);
    }

    public function testAntiPassbackIsPerGateSoASecondHallStillAdmits(): void
    {
        $verifier = $this->verifier(new TapPolicy(passReuseCooldownSeconds: 60));
        $pass = $this->pass();

        $verifier->verify($this->request($pass));
        $result = $verifier->verify($this->request($pass, terminalId: 'gate-hall-b'));

        $this->assertSame('gate-hall-b', $result->terminalId);
    }

    private function pass(
        string $audienceId = self::EVENT,
        ?int $notBefore = null,
        ?int $notAfter = null,
        ?string $privateKey = null,
    ): string {
        $notBefore ??= $this->clock->now()->getTimestamp() - 3600;
        $notAfter ??= $this->clock->now()->getTimestamp() + 3600 * 12;
        $signature = TapTestKit::sign(
            $this->codec->issuedPassSignedBytes(self::PASS, $audienceId, $notBefore, $notAfter),
            $privateKey ?? $this->issuerPrivateKey,
        );

        return $this->codec->encodeIssuedPass(self::PASS, $audienceId, $notBefore, $notAfter, $signature);
    }

    private function request(string $assertion, string $terminalId = self::GATE): TapRequest
    {
        return new TapRequest(
            assertion: $assertion,
            nonce: random_bytes(16),
            terminalId: $terminalId,
            audienceId: self::EVENT,
        );
    }

    private function verifier(?TapPolicy $policy = null): TapVerifier
    {
        return new TapVerifier(
            credentials: new InMemoryCredentialStore(),
            issuerKeys: $this->issuerKeys,
            nonces: $this->nonces,
            signatures: new OpenSslEs256Verifier(),
            clock: $this->clock,
            policy: $policy ?? new TapPolicy(),
            codec: $this->codec,
        );
    }
}

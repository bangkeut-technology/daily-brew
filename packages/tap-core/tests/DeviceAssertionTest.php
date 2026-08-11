<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests;

use Bangkeut\Tap\Assertion\AssertionCodec;
use Bangkeut\Tap\Assertion\AssertionKind;
use Bangkeut\Tap\Exception\AssertionExpired;
use Bangkeut\Tap\Exception\InvalidSignature;
use Bangkeut\Tap\Exception\NonceAlreadyUsed;
use Bangkeut\Tap\Exception\UnknownCredential;
use Bangkeut\Tap\Signature\OpenSslEs256Verifier;
use Bangkeut\Tap\TapPolicy;
use Bangkeut\Tap\TapRequest;
use Bangkeut\Tap\TapVerifier;
use Bangkeut\Tap\Tests\Support\FrozenClock;
use Bangkeut\Tap\Tests\Support\InMemoryCredential;
use Bangkeut\Tap\Tests\Support\InMemoryCredentialStore;
use Bangkeut\Tap\Tests\Support\InMemoryIssuerKeyStore;
use Bangkeut\Tap\Tests\Support\InMemoryNonceStore;
use Bangkeut\Tap\Tests\Support\TapTestKit;
use PHPUnit\Framework\TestCase;

class DeviceAssertionTest extends TestCase
{
    private const string HOLDER = 'abc123def456';
    private const string TERMINAL = 'kiosk-front-door';
    private const string AUDIENCE = 'wsp111222333';

    private AssertionCodec $codec;
    private FrozenClock $clock;
    private InMemoryCredentialStore $credentials;
    private InMemoryNonceStore $nonces;
    private string $privateKey;

    protected function setUp(): void
    {
        $this->codec = new AssertionCodec();
        $this->clock = FrozenClock::at('2026-08-11 09:00:00');
        $this->credentials = new InMemoryCredentialStore();
        $this->nonces = new InMemoryNonceStore();

        [$this->privateKey, $publicKey] = TapTestKit::keyPair();
        $this->credentials->add(new InMemoryCredential('cred-1', self::HOLDER, $publicKey));
    }

    public function testAGenuineTapVerifiesAndNamesTheCredentialThatMatched(): void
    {
        $nonce = random_bytes(16);
        $request = new TapRequest(
            assertion: $this->assertion($nonce),
            nonce: $nonce,
            terminalId: self::TERMINAL,
            audienceId: self::AUDIENCE,
        );

        $result = $this->verifier()->verify($request);

        $this->assertSame(AssertionKind::DeviceAssertion, $result->kind);
        $this->assertSame(self::HOLDER, $result->subjectId);
        $this->assertSame(self::TERMINAL, $result->terminalId);
        $this->assertSame('cred-1', $result->credential?->credentialId());
        $this->assertSame('2026-08-11 09:00:00', $result->tappedAt->format('Y-m-d H:i:s'));
    }

    public function testASignatureOverADifferentNonceIsRejected(): void
    {
        // Exactly what a replay attacker holds: a valid assertion captured at an earlier tap.
        $capturedNonce = random_bytes(16);
        $assertion = $this->assertion($capturedNonce);

        $this->expectException(InvalidSignature::class);
        $this->verifier()->verify(new TapRequest(
            assertion: $assertion,
            nonce: random_bytes(16), // the terminal moved on
            terminalId: self::TERMINAL,
            audienceId: self::AUDIENCE,
        ));
    }

    public function testASignatureBoundToAnotherTerminalIsRejected(): void
    {
        $nonce = random_bytes(16);
        $assertion = $this->assertion($nonce, terminalId: 'kiosk-back-door');

        $this->expectException(InvalidSignature::class);
        $this->verifier()->verify(new TapRequest(
            assertion: $assertion,
            nonce: $nonce,
            terminalId: self::TERMINAL,
            audienceId: self::AUDIENCE,
        ));
    }

    public function testTheSameNonceCannotBeUsedTwiceAtATerminal(): void
    {
        $nonce = random_bytes(16);
        $request = new TapRequest(
            assertion: $this->assertion($nonce),
            nonce: $nonce,
            terminalId: self::TERMINAL,
            audienceId: self::AUDIENCE,
        );
        $verifier = $this->verifier();
        $verifier->verify($request);

        $this->expectException(NonceAlreadyUsed::class);
        $verifier->verify($request);
    }

    public function testAFailedTapDoesNotBurnTheNonce(): void
    {
        $nonce = random_bytes(16);
        $stale = $this->assertion($nonce, tappedAt: $this->clock->now()->getTimestamp() - 600);

        try {
            $this->verifier()->verify(new TapRequest(
                assertion: $stale,
                nonce: $nonce,
                terminalId: self::TERMINAL,
                audienceId: self::AUDIENCE,
            ));
            $this->fail('Expected the stale assertion to be rejected.');
        } catch (AssertionExpired) {
            // The holder should be able to just tap again — so nothing may have been consumed.
            $this->assertSame([], $this->nonces->claimed);
        }
    }

    public function testAnUnenrolledHolderIsDistinguishedFromABadSignature(): void
    {
        $nonce = random_bytes(16);
        $assertion = $this->codec->encodeDevice(
            'zzz999yyy888',
            $this->clock->now()->getTimestamp(),
            str_repeat("\x01", 64),
        );

        $this->expectException(UnknownCredential::class);
        $this->verifier()->verify(new TapRequest(
            assertion: $assertion,
            nonce: $nonce,
            terminalId: self::TERMINAL,
            audienceId: self::AUDIENCE,
        ));
    }

    public function testASecondEnrolledDeviceForTheSameHolderAlsoWorks(): void
    {
        [$sparePrivate, $sparePublic] = TapTestKit::keyPair();
        $this->credentials->add(new InMemoryCredential('cred-2', self::HOLDER, $sparePublic));

        $nonce = random_bytes(16);
        $assertion = $this->assertion($nonce, privateKey: $sparePrivate);

        $result = $this->verifier()->verify(new TapRequest(
            assertion: $assertion,
            nonce: $nonce,
            terminalId: self::TERMINAL,
            audienceId: self::AUDIENCE,
        ));

        $this->assertSame('cred-2', $result->credential?->credentialId());
    }

    public function testAClockRunningAheadIsToleratedOnlyWithinSkew(): void
    {
        $verifier = $this->verifier();
        $now = $this->clock->now()->getTimestamp();

        $nonce = random_bytes(16);
        $verifier->verify(new TapRequest(
            assertion: $this->assertion($nonce, tappedAt: $now + 20),
            nonce: $nonce,
            terminalId: self::TERMINAL,
            audienceId: self::AUDIENCE,
        ));

        $this->expectException(AssertionExpired::class);
        $farAheadNonce = random_bytes(16);
        $verifier->verify(new TapRequest(
            assertion: $this->assertion($farAheadNonce, tappedAt: $now + 3600),
            nonce: $farAheadNonce,
            terminalId: self::TERMINAL,
            audienceId: self::AUDIENCE,
        ));
    }

    public function testAnOfflineQueueReplayedHoursLaterStillVerifies(): void
    {
        $nonce = random_bytes(16);
        $tappedAt = $this->clock->now()->getTimestamp();
        $assertion = $this->assertion($nonce, tappedAt: $tappedAt);

        // The door lost wifi and only reached the server the next morning.
        $this->clock->move('+9 hours');

        $result = $this->verifier()->verify(new TapRequest(
            assertion: $assertion,
            nonce: $nonce,
            terminalId: self::TERMINAL,
            audienceId: self::AUDIENCE,
            offlineBatch: true,
        ));

        $this->assertTrue($result->offlineBatch);
        // The recorded time is the tap, not the upload — the whole point of queueing.
        $this->assertSame($tappedAt, $result->tappedAt->getTimestamp());
    }

    public function testReplayingTheSameQueueTwiceAdmitsNobodyTwice(): void
    {
        $nonce = random_bytes(16);
        $request = new TapRequest(
            assertion: $this->assertion($nonce),
            nonce: $nonce,
            terminalId: self::TERMINAL,
            audienceId: self::AUDIENCE,
            offlineBatch: true,
        );
        $verifier = $this->verifier();
        $verifier->verify($request);

        $this->expectException(NonceAlreadyUsed::class);
        $verifier->verify($request);
    }

    private function assertion(
        string $nonce,
        ?int $tappedAt = null,
        string $terminalId = self::TERMINAL,
        ?string $privateKey = null,
    ): string {
        $tappedAt ??= $this->clock->now()->getTimestamp();
        $signature = TapTestKit::sign(
            $this->codec->deviceSignedBytes($nonce, $terminalId, self::HOLDER, $tappedAt),
            $privateKey ?? $this->privateKey,
        );

        return $this->codec->encodeDevice(self::HOLDER, $tappedAt, $signature);
    }

    private function verifier(): TapVerifier
    {
        return new TapVerifier(
            credentials: $this->credentials,
            issuerKeys: new InMemoryIssuerKeyStore(),
            nonces: $this->nonces,
            signatures: new OpenSslEs256Verifier(),
            clock: $this->clock,
            policy: new TapPolicy(),
            codec: $this->codec,
        );
    }
}

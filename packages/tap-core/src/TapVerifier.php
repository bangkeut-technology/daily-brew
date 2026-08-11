<?php

declare(strict_types=1);

namespace Bangkeut\Tap;

use Bangkeut\Tap\Assertion\AssertionCodec;
use Bangkeut\Tap\Assertion\DeviceAssertion;
use Bangkeut\Tap\Assertion\IssuedPassAssertion;
use Bangkeut\Tap\Credential\Credential;
use Bangkeut\Tap\Credential\CredentialStore;
use Bangkeut\Tap\Credential\IssuerKeyStore;
use Bangkeut\Tap\Exception\AssertionExpired;
use Bangkeut\Tap\Exception\AudienceMismatch;
use Bangkeut\Tap\Exception\InvalidSignature;
use Bangkeut\Tap\Exception\NonceAlreadyUsed;
use Bangkeut\Tap\Exception\PassExpired;
use Bangkeut\Tap\Exception\PassNotYetValid;
use Bangkeut\Tap\Exception\PassRecentlyUsed;
use Bangkeut\Tap\Exception\PassRevoked;
use Bangkeut\Tap\Exception\UnknownCredential;
use Bangkeut\Tap\Exception\UnknownIssuer;
use Bangkeut\Tap\Nonce\NonceStore;
use Bangkeut\Tap\Revocation\NullRevocationStore;
use Bangkeut\Tap\Revocation\RevocationStore;
use Bangkeut\Tap\Signature\SignatureVerifier;
use Psr\Clock\ClockInterface;

/**
 * Turns bytes presented at a terminal into a verified TapResult, or throws a typed TapException
 * explaining the refusal.
 *
 * Ordering is deliberate throughout: cheap structural checks first, signature verification before
 * any state is mutated, and single-use consumption *last* — so a tap that fails for any other
 * reason doesn't burn the holder's nonce and force them to tap twice.
 */
final readonly class TapVerifier
{
    public function __construct(
        private CredentialStore $credentials,
        private IssuerKeyStore $issuerKeys,
        private NonceStore $nonces,
        private SignatureVerifier $signatures,
        private ClockInterface $clock,
        private TapPolicy $policy = new TapPolicy(),
        /** Issued passes only — a device key is revoked by dropping it from the CredentialStore. */
        private RevocationStore $revocations = new NullRevocationStore(),
        private AssertionCodec $codec = new AssertionCodec(),
    ) {
    }

    public function verify(TapRequest $request): TapResult
    {
        $assertion = $this->codec->decode($request->assertion);

        return match (true) {
            $assertion instanceof DeviceAssertion => $this->verifyDevice($assertion, $request),
            $assertion instanceof IssuedPassAssertion => $this->verifyIssuedPass($assertion, $request),
        };
    }

    private function verifyDevice(DeviceAssertion $assertion, TapRequest $request): TapResult
    {
        $now = $this->clock->now();
        $this->assertFresh($assertion->tappedAt, $now, $request->offlineBatch);

        $credential = $this->matchCredential($assertion, $request);

        // Consumed only once everything else passed: a rejected tap must be retryable.
        if (!$this->nonces->consume(
            $this->scope('nonce', $request->terminalId),
            $request->nonce,
            $this->policy->nonceTtlSeconds,
        )) {
            throw new NonceAlreadyUsed('This nonce was already used at this terminal.');
        }

        return new TapResult(
            kind: $assertion->kind(),
            subjectId: $assertion->holderId,
            terminalId: $request->terminalId,
            audienceId: $request->audienceId,
            tappedAt: $now->setTimestamp($assertion->tappedAt),
            credential: $credential,
            offlineBatch: $request->offlineBatch,
        );
    }

    private function verifyIssuedPass(IssuedPassAssertion $assertion, TapRequest $request): TapResult
    {
        if (!hash_equals($request->audienceId, $assertion->audienceId)) {
            throw new AudienceMismatch('This pass was issued for a different event.');
        }

        $now = $this->clock->now();
        $seconds = $now->getTimestamp();
        if ($seconds < $assertion->notBefore) {
            throw new PassNotYetValid('This pass is not valid yet.');
        }
        if ($seconds > $assertion->notAfter) {
            throw new PassExpired('This pass has expired.');
        }

        $signedBytes = $this->codec->issuedPassSignedBytes(
            $assertion->passId,
            $assertion->audienceId,
            $assertion->notBefore,
            $assertion->notAfter,
        );

        $keys = $this->issuerKeys->publicKeysFor($assertion->audienceId);
        $sawKey = false;
        $verified = false;
        foreach ($keys as $publicKeyPem) {
            $sawKey = true;
            if ($this->signatures->verify($signedBytes, $assertion->signature(), $publicKeyPem)) {
                $verified = true;
                break;
            }
        }

        if (!$sawKey) {
            throw new UnknownIssuer('No issuer key is configured for this event.');
        }
        if (!$verified) {
            throw new InvalidSignature('This pass was not signed by a trusted issuer key.');
        }

        // Checked after the signature — an unauthenticated forger shouldn't be able to probe which
        // pass ids exist — and before the cooldown, so a withdrawn pass doesn't burn the
        // anti-passback slot of whoever legitimately taps next.
        if ($this->revocations->isRevoked($assertion->passId, $assertion->audienceId)) {
            throw new PassRevoked('This pass has been withdrawn.');
        }

        // Anti-passback. A pass is a bearer token, so this is the only thing standing between one
        // ticket and a queue of friends using it — but re-entry is legitimate at most events, hence
        // a cooldown rather than a hard one-shot.
        if ($this->policy->passReuseCooldownSeconds > 0 && !$this->nonces->consume(
            $this->scope('pass', $request->terminalId),
            $assertion->passId,
            $this->policy->passReuseCooldownSeconds,
        )) {
            throw new PassRecentlyUsed('This pass was already admitted here moments ago.');
        }

        return new TapResult(
            kind: $assertion->kind(),
            subjectId: $assertion->passId,
            terminalId: $request->terminalId,
            audienceId: $request->audienceId,
            tappedAt: $now,
            offlineBatch: $request->offlineBatch,
        );
    }

    private function matchCredential(DeviceAssertion $assertion, TapRequest $request): Credential
    {
        $signedBytes = $this->codec->deviceSignedBytes(
            $request->nonce,
            $request->terminalId,
            $assertion->holderId,
            $assertion->tappedAt,
        );

        $sawCredential = false;
        foreach ($this->credentials->activeCredentialsFor($assertion->holderId) as $credential) {
            $sawCredential = true;
            if ($this->signatures->verify($signedBytes, $assertion->signature(), $credential->publicKeyPem())) {
                return $credential;
            }
        }

        // Distinguished on purpose: "we don't know you" and "that isn't your signature" need
        // different operator responses — enrol the device, versus investigate.
        throw $sawCredential
            ? new InvalidSignature('No enrolled device key matches this signature.')
            : new UnknownCredential('No active credential is enrolled for this holder.');
    }

    private function assertFresh(int $tappedAt, \DateTimeImmutable $now, bool $offlineBatch): void
    {
        $age = $now->getTimestamp() - $tappedAt;
        if ($age > $this->policy->assertionMaxAge($offlineBatch)) {
            throw new AssertionExpired('This tap is too old to accept.');
        }
        if (-$age > $this->policy->maxFutureSkewSeconds) {
            throw new AssertionExpired('This tap is dated in the future.');
        }
    }

    private function scope(string $prefix, string $terminalId): string
    {
        return $prefix.':'.$terminalId;
    }
}

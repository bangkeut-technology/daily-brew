<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Issuance;

use Bangkeut\Tap\Assertion\AssertionCodec;
use Bangkeut\Tap\Exception\PassIssuanceFailed;
use Bangkeut\Tap\Signature\OpenSslEs256Signer;
use Bangkeut\Tap\Signature\Signer;

/**
 * Mints kind 0x02 passes — the other half of {@see \Bangkeut\Tap\TapVerifier}.
 *
 * The issuer signs once, at ticket purchase, and is then out of the picture: the door verifies with
 * the public key alone, offline, months later. That is the whole point of this credential kind, and
 * it is also why every mistake has to be caught here. A pass with a broken validity window can't be
 * fixed at the gate — the signature covers it.
 *
 * Holds one private key. Rotating means constructing a new issuer with the new key while the
 * terminal's IssuerKeyStore keeps publishing the old public key until the passes signed with it
 * have expired.
 */
final readonly class PassIssuer
{
    /** The wire format stores both timestamps as uint32 (SPEC.md), so the window ends in 2106. */
    private const int MAX_TIMESTAMP = 4294967295;

    public function __construct(
        private string $privateKeyPem,
        private Signer $signer = new OpenSslEs256Signer(),
        private AssertionCodec $codec = new AssertionCodec(),
    ) {
    }

    /**
     * @param string $passId     12 bytes; {@see PassId::generate()} produces one
     * @param string $audienceId the event this pass is good for — a terminal serving another
     *                           audience refuses it even though the signature is valid
     *
     * @throws PassIssuanceFailed when the pass could never be admitted as described
     * @throws \Bangkeut\Tap\Exception\SigningFailed when the key is unusable
     */
    public function issue(
        string $passId,
        string $audienceId,
        \DateTimeImmutable $notBefore,
        \DateTimeImmutable $notAfter,
    ): IssuedPass {
        PassId::assertValid($passId, 'passId');
        PassId::assertValid($audienceId, 'audienceId');

        $from = $this->timestamp($notBefore, 'notBefore');
        $until = $this->timestamp($notAfter, 'notAfter');

        if ($until <= $from) {
            throw new PassIssuanceFailed('notAfter must be later than notBefore.');
        }

        $signature = $this->signer->sign(
            $this->codec->issuedPassSignedBytes($passId, $audienceId, $from, $until),
            $this->privateKeyPem,
        );

        $bytes = $this->codec->encodeIssuedPass($passId, $audienceId, $from, $until, $signature);

        return new IssuedPass(
            passId: $passId,
            audienceId: $audienceId,
            // Re-derived from the integers actually signed, so the object can never describe a
            // window that differs from the one in the bytes — sub-second precision is dropped.
            notBefore: (new \DateTimeImmutable('@'.$from))->setTimezone($notBefore->getTimezone()),
            notAfter: (new \DateTimeImmutable('@'.$until))->setTimezone($notAfter->getTimezone()),
            bytes: $bytes,
            base64Url: $this->codec->toBase64Url($bytes),
        );
    }

    /**
     * pack('N', …) truncates silently, which would mint a pass whose window is off by 136 years and
     * whose signature covers the wrong one. Refuse instead.
     */
    private function timestamp(\DateTimeImmutable $moment, string $field): int
    {
        $seconds = $moment->getTimestamp();

        if ($seconds < 0 || $seconds > self::MAX_TIMESTAMP) {
            throw new PassIssuanceFailed(sprintf(
                '%s (%s) is outside the range the wire format can carry (1970-01-01 to 2106-02-07).',
                $field,
                $moment->format('c'),
            ));
        }

        return $seconds;
    }
}

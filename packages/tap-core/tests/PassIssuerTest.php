<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests;

use Bangkeut\Tap\Assertion\AssertionCodec;
use Bangkeut\Tap\Assertion\AssertionKind;
use Bangkeut\Tap\Exception\AudienceMismatch;
use Bangkeut\Tap\Exception\InvalidSignature;
use Bangkeut\Tap\Exception\PassIssuanceFailed;
use Bangkeut\Tap\Issuance\IssuedPass;
use Bangkeut\Tap\Issuance\PassId;
use Bangkeut\Tap\Issuance\PassIssuer;
use Bangkeut\Tap\Signature\Es256KeyPair;
use Bangkeut\Tap\Signature\OpenSslEs256Verifier;
use Bangkeut\Tap\Tap;
use Bangkeut\Tap\TapPolicy;
use Bangkeut\Tap\TapRequest;
use Bangkeut\Tap\TapVerifier;
use Bangkeut\Tap\Tests\Support\FrozenClock;
use Bangkeut\Tap\Tests\Support\InMemoryCredentialStore;
use Bangkeut\Tap\Tests\Support\InMemoryIssuerKeyStore;
use Bangkeut\Tap\Tests\Support\InMemoryNonceStore;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * The issuing half. IssuedPassTest hand-signs bytes to prove the verifier refuses what it should;
 * this one proves the issuer produces what the verifier accepts — the two meet in the round-trip
 * test below, which is the only place both halves run against each other.
 */
class PassIssuerTest extends TestCase
{
    private const string EVENT = 'amcham0926ex';
    private const string GATE = 'gate-hall-a';

    private Es256KeyPair $issuerKey;
    private PassIssuer $issuer;
    private FrozenClock $clock;

    protected function setUp(): void
    {
        $this->issuerKey = Es256KeyPair::generate();
        $this->issuer = new PassIssuer($this->issuerKey->privateKeyPem);
        $this->clock = FrozenClock::at('2026-09-26 08:30:00');
    }

    public function testAMintedPassIsAdmittedByTheVerifier(): void
    {
        $passId = PassId::generate();
        $pass = $this->issue($passId);

        $result = $this->verifier()->verify(new TapRequest(
            assertion: $pass->bytes,
            nonce: random_bytes(16),
            terminalId: self::GATE,
            audienceId: self::EVENT,
        ));

        $this->assertSame(AssertionKind::IssuedPass, $result->kind);
        $this->assertSame($passId, $result->subjectId);
        $this->assertSame(self::EVENT, $result->audienceId);
    }

    public function testAPassSurvivesTheBarcodeRoundTrip(): void
    {
        $pass = $this->issue();
        $codec = new AssertionCodec();

        // What a QR code carries is the base64url string, so that is what has to come back intact.
        $scanned = $codec->fromBase64Url($pass->base64Url);

        $this->assertSame($pass->bytes, $scanned);
        $this->assertStringNotContainsString('=', $pass->base64Url);
        $this->assertSame($pass->passId, $this->verifier()->verify(new TapRequest(
            assertion: $scanned,
            nonce: random_bytes(16),
            terminalId: self::GATE,
            audienceId: self::EVENT,
        ))->subjectId);
    }

    public function testAMintedPassIsExactlyTheDocumentedLength(): void
    {
        // Other-language issuer SDKs check themselves against this number; SPEC.md carries the
        // field-by-field layout that produces it.
        $this->assertSame(Tap::ISSUED_PASS_LENGTH, strlen($this->issue()->bytes));
    }

    public function testTheReturnedWindowMatchesTheSignedBytes(): void
    {
        $notBefore = new \DateTimeImmutable('2026-09-26 07:00:00.750');
        $notAfter = new \DateTimeImmutable('2026-09-26 19:00:00.250');

        $pass = $this->issuer->issue(PassId::generate(), self::EVENT, $notBefore, $notAfter);
        $decoded = (new AssertionCodec())->decode($pass->bytes);

        // Sub-second precision is dropped by the wire format, so the object must report the
        // truncated values — otherwise an issuer UI would show a window the door doesn't honour.
        $this->assertSame($notBefore->getTimestamp(), $pass->notBefore->getTimestamp());
        $this->assertSame($notAfter->getTimestamp(), $pass->notAfter->getTimestamp());
        $this->assertSame($notBefore->getTimestamp(), $decoded->notBefore);
        $this->assertSame($notAfter->getTimestamp(), $decoded->notAfter);
    }

    public function testAPassMintedForAnotherAudienceIsRefusedAtThisGate(): void
    {
        $pass = $this->issue(audienceId: 'eurocham0926');

        $this->expectException(AudienceMismatch::class);
        $this->verifier()->verify(new TapRequest(
            assertion: $pass->bytes,
            nonce: random_bytes(16),
            terminalId: self::GATE,
            audienceId: self::EVENT,
        ));
    }

    public function testAPassFromAnUntrustedSignerIsRefused(): void
    {
        $pass = (new PassIssuer(Es256KeyPair::generate()->privateKeyPem))
            ->issue(PassId::generate(), self::EVENT, $this->at('-1 hour'), $this->at('+8 hours'));

        // The gate trusts $this->issuerKey only — a well-formed pass from an untrusted signer is
        // exactly the forgery this credential kind has to refuse.
        $this->expectException(InvalidSignature::class);
        $this->verifier()->verify(new TapRequest(
            assertion: $pass->bytes,
            nonce: random_bytes(16),
            terminalId: self::GATE,
            audienceId: self::EVENT,
        ));
    }

    public function testAWindowThatEndsBeforeItStartsIsRefusedAtIssuance(): void
    {
        $this->expectException(PassIssuanceFailed::class);
        $this->expectExceptionMessage('notAfter must be later than notBefore.');

        $this->issuer->issue(
            PassId::generate(),
            self::EVENT,
            $this->at('+8 hours'),
            $this->at('-1 hour'),
        );
    }

    public function testAZeroLengthWindowIsRefused(): void
    {
        $moment = $this->at('+1 hour');

        $this->expectException(PassIssuanceFailed::class);
        $this->issuer->issue(PassId::generate(), self::EVENT, $moment, $moment);
    }

    public function testATimestampBeyondTheWireFormatIsRefusedRatherThanTruncated(): void
    {
        // pack('N', …) would wrap this silently and mint a pass whose signed window is 136 years
        // off — the failure would surface at a door, months later, with no way to diagnose it.
        $this->expectException(PassIssuanceFailed::class);
        $this->expectExceptionMessage('outside the range the wire format can carry');

        $this->issuer->issue(
            PassId::generate(),
            self::EVENT,
            $this->at('+1 hour'),
            new \DateTimeImmutable('2200-01-01 00:00:00'),
        );
    }

    /** @param non-empty-string $badId */
    #[DataProvider('unusableIds')]
    public function testAnIdThatBreaksTheWireFormatIsRefusedAtIssuance(string $badId, string $expected): void
    {
        $this->expectException(PassIssuanceFailed::class);
        $this->expectExceptionMessage($expected);

        $this->issuer->issue($badId, self::EVENT, $this->at('-1 hour'), $this->at('+8 hours'));
    }

    /** @return iterable<string, array{0: string, 1: string}> */
    public static function unusableIds(): iterable
    {
        yield 'too short' => ['short', 'passId must be exactly 12 bytes'];
        yield 'too long' => ['thirteenchars', 'passId must be exactly 12 bytes'];
        yield 'multibyte' => ['pass1122334é', 'passId must be exactly 12 bytes'];
        yield 'contains a space' => ['pass 1122334', 'printable ASCII'];
        yield 'contains a newline' => ["pass112233\n4", 'printable ASCII'];
    }

    public function testGeneratedIdsFitTheWireFormatAndAvoidAmbiguousCharacters(): void
    {
        for ($i = 0; $i < 50; $i++) {
            $id = PassId::generate();

            $this->assertSame(Tap::ID_LENGTH, strlen($id));
            $this->assertMatchesRegularExpression('/^['.PassId::ALPHABET.']{12}$/', $id);
        }
    }

    public function testGeneratedIdsAreNotSequential(): void
    {
        $ids = [];
        for ($i = 0; $i < 200; $i++) {
            $ids[] = PassId::generate();
        }

        // Not a randomness test — just a smoke alarm for a generator that got wired to a counter
        // or a seeded PRNG, which would make pass ids guessable.
        $this->assertCount(200, array_unique($ids));
    }

    public function testAKeyPairRoundTripsThroughItsPrivateHalf(): void
    {
        $reloaded = Es256KeyPair::fromPrivateKeyPem($this->issuerKey->privateKeyPem);

        // An issuer that loads its key from a secret store must derive the same public key the
        // terminals were given, or every pass it mints is refused.
        $this->assertSame($this->issuerKey->publicKeyPem, $reloaded->publicKeyPem);
    }

    public function testIsValidAtReportsTheWindowTheDoorWillEnforce(): void
    {
        $pass = $this->issuer->issue(
            PassId::generate(),
            self::EVENT,
            $this->at('+1 hour'),
            $this->at('+9 hours'),
        );

        $this->assertFalse($pass->isValidAt($this->clock->now()));
        $this->assertTrue($pass->isValidAt($this->at('+2 hours')));
        $this->assertFalse($pass->isValidAt($this->at('+10 hours')));
    }

    private function issue(?string $passId = null, string $audienceId = self::EVENT): IssuedPass
    {
        return $this->issuer->issue(
            $passId ?? PassId::generate(),
            $audienceId,
            $this->at('-1 hour'),
            $this->at('+8 hours'),
        );
    }

    private function at(string $modifier): \DateTimeImmutable
    {
        return $this->clock->now()->modify($modifier);
    }

    private function verifier(): TapVerifier
    {
        $issuerKeys = new InMemoryIssuerKeyStore();
        $issuerKeys->add(self::EVENT, $this->issuerKey->publicKeyPem);

        return new TapVerifier(
            credentials: new InMemoryCredentialStore(),
            issuerKeys: $issuerKeys,
            nonces: new InMemoryNonceStore(),
            signatures: new OpenSslEs256Verifier(),
            clock: $this->clock,
            policy: new TapPolicy(),
        );
    }
}

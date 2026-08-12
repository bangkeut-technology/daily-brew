<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Integration;

use App\Entity\ApiToken;
use App\Entity\User;
use App\Entity\Workspace;
use App\Exception\InvalidSignedRequestException;
use App\Repository\ApiTokenRepository;
use App\Service\DateService;
use App\Service\Integration\RequestSignature;
use App\Service\Integration\SecretCipher;
use App\Service\Integration\SignedRequestVerifier;
use DateTimeZone;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Symfony\Component\Cache\Adapter\ArrayAdapter;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\HttpFoundation\Request;

/**
 * The rejection matrix. Every case here is a way a forged or replayed request
 * could otherwise land an attendance record, so each one gets its own test
 * rather than being folded into a happy-path assertion.
 */
#[AllowMockObjectsWithoutExpectations]
class SignedRequestVerifierTest extends TestCase
{
    private const string NOW = '2026-08-12 10:00:00';
    /**
     * Deliberately a readable phrase rather than a realistic `dbs_<hex>` value:
     * secret scanners flag high-entropy fixtures, and HMAC doesn't care what the
     * key looks like.
     */
    private const string SECRET = 'test-signing-key-not-a-secret';
    private const string PATH = '/api/v1/integrations/attendances';
    private const string BODY = '{"date":"2026-08-12"}';

    private ApiTokenRepository&MockObject $tokens;
    private ArrayAdapter $nonces;
    private SecretCipher $cipher;
    private SignedRequestVerifier $verifier;

    protected function setUp(): void
    {
        DateService::setClock(new MockClock(self::NOW, new DateTimeZone('UTC')));
        $this->tokens = $this->createMock(ApiTokenRepository::class);
        $this->nonces = new ArrayAdapter();
        $this->cipher = new SecretCipher(base64_encode(str_repeat("\x07", SODIUM_CRYPTO_SECRETBOX_KEYBYTES)), '');
        $this->verifier = new SignedRequestVerifier($this->tokens, $this->cipher, $this->nonces, new NullLogger());
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
    }

    public function testAcceptsACorrectlySignedRequest(): void
    {
        $token = $this->token();
        $this->tokens->method('findActiveByPublicId')->willReturn($token);

        $verified = $this->verifier->verify($this->signedRequest());

        $this->assertSame($token, $verified);
    }

    public function testRejectsATamperedBody(): void
    {
        $this->tokens->method('findActiveByPublicId')->willReturn($this->token());

        // Signed one payload, sent another — the classic man-in-the-middle edit.
        $request = $this->signedRequest(sendBody: '{"date":"2026-08-11"}');

        $this->expectExceptionMessage(InvalidSignedRequestException::PUBLIC_MESSAGE);
        $this->verifier->verify($request);
    }

    public function testRejectsAReplayedPathWithTheSameSignature(): void
    {
        $this->tokens->method('findActiveByPublicId')->willReturn($this->token());

        // A signature captured on one endpoint must not authorise another.
        $request = $this->signedRequest(sendPath: '/api/v1/integrations/something-else');

        $this->expectException(InvalidSignedRequestException::class);
        $this->verifier->verify($request);
    }

    public function testRejectsAStaleTimestamp(): void
    {
        $this->tokens->method('findActiveByPublicId')->willReturn($this->token());

        $stale = DateService::now()->getTimestamp() - (SignedRequestVerifier::MAX_SKEW_SECONDS + 1);

        $this->expectException(InvalidSignedRequestException::class);
        $this->verifier->verify($this->signedRequest(timestamp: $stale));
    }

    public function testRejectsATimestampFromTheFuture(): void
    {
        $this->tokens->method('findActiveByPublicId')->willReturn($this->token());

        // Skew is absolute: a clock running fast is as suspect as one running slow,
        // and a far-future timestamp would otherwise mint a very long-lived request.
        $future = DateService::now()->getTimestamp() + (SignedRequestVerifier::MAX_SKEW_SECONDS + 1);

        $this->expectException(InvalidSignedRequestException::class);
        $this->verifier->verify($this->signedRequest(timestamp: $future));
    }

    public function testAcceptsATimestampInsideTheSkewWindow(): void
    {
        $this->tokens->method('findActiveByPublicId')->willReturn($this->token());

        $recent = DateService::now()->getTimestamp() - (SignedRequestVerifier::MAX_SKEW_SECONDS - 5);

        $this->expectNotToPerformAssertions();
        $this->verifier->verify($this->signedRequest(timestamp: $recent));
    }

    public function testRejectsAReplayedNonce(): void
    {
        $this->tokens->method('findActiveByPublicId')->willReturn($this->token());

        // Byte-for-byte the same request twice: valid once, replay after that.
        $this->verifier->verify($this->signedRequest(nonce: 'nonce-replayed-01'));

        $this->expectException(InvalidSignedRequestException::class);
        $this->verifier->verify($this->signedRequest(nonce: 'nonce-replayed-01'));
    }

    public function testTheSameNonceIsFineForADifferentKey(): void
    {
        $other = $this->token(publicId: 'otherkey0001');
        $this->tokens->method('findActiveByPublicId')->willReturnCallback(
            fn (string $id) => $id === 'otherkey0001' ? $other : $this->token(),
        );

        $this->verifier->verify($this->signedRequest(nonce: 'nonce-shared-0001'));

        // Nonces are scoped per key — two integrations picking the same random
        // string must not lock each other out.
        $this->expectNotToPerformAssertions();
        $this->verifier->verify($this->signedRequest(nonce: 'nonce-shared-0001', keyId: 'otherkey0001'));
    }

    public function testRejectsAnUnknownKeyId(): void
    {
        $this->tokens->method('findActiveByPublicId')->willReturn(null);

        $this->expectException(InvalidSignedRequestException::class);
        $this->verifier->verify($this->signedRequest());
    }

    public function testRejectsAKeyBelongingToADeletedWorkspace(): void
    {
        $token = $this->token();
        $token->getWorkspace()->setDeletedAt(DateService::now());
        $this->tokens->method('findActiveByPublicId')->willReturn($token);

        $this->expectException(InvalidSignedRequestException::class);
        $this->verifier->verify($this->signedRequest());
    }

    public function testRejectsAKeyMintedBeforeSigningExisted(): void
    {
        $token = $this->token();
        $token->setSigningSecretEncrypted(null);
        $this->tokens->method('findActiveByPublicId')->willReturn($token);

        $this->expectException(InvalidSignedRequestException::class);
        $this->verifier->verify($this->signedRequest());
    }

    public function testRejectsASecretThatCannotBeDecrypted(): void
    {
        $token = $this->token();
        // Wrong encryption key, or a tampered row: fail closed rather than
        // HMAC-ing with whatever bytes came back.
        $token->setSigningSecretEncrypted(base64_encode(random_bytes(64)));
        $this->tokens->method('findActiveByPublicId')->willReturn($token);

        $this->expectException(InvalidSignedRequestException::class);
        $this->verifier->verify($this->signedRequest());
    }

    public function testRejectsAShortNonce(): void
    {
        $this->tokens->method('findActiveByPublicId')->willReturn($this->token());

        $this->expectException(InvalidSignedRequestException::class);
        $this->verifier->verify($this->signedRequest(nonce: 'short'));
    }

    public function testRejectsMissingSigningHeaders(): void
    {
        $this->tokens->method('findActiveByPublicId')->willReturn($this->token());

        $request = Request::create(self::PATH, 'POST', server: [], content: self::BODY);
        $request->headers->set(RequestSignature::HEADER_SIGNATURE, 'v1=deadbeef');

        $this->expectException(InvalidSignedRequestException::class);
        $this->verifier->verify($request);
    }

    public function testRejectsANonNumericTimestamp(): void
    {
        $this->tokens->method('findActiveByPublicId')->willReturn($this->token());

        $request = $this->signedRequest();
        $request->headers->set(RequestSignature::HEADER_TIMESTAMP, 'yesterday');

        $this->expectException(InvalidSignedRequestException::class);
        $this->verifier->verify($request);
    }

    public function testEveryRejectionCarriesTheSamePublicMessage(): void
    {
        $this->tokens->method('findActiveByPublicId')->willReturn(null);

        try {
            $this->verifier->verify($this->signedRequest());
            $this->fail('expected rejection');
        } catch (InvalidSignedRequestException $e) {
            // The specific cause goes to the log; a caller learns nothing that
            // would let it enumerate key ids or confirm a captured signature.
            $this->assertSame(InvalidSignedRequestException::PUBLIC_MESSAGE, $e->getMessage());
            $this->assertNotSame($e->getMessage(), $e->reason);
        }
    }

    private function token(string $publicId = 'testkey00001'): ApiToken
    {
        $workspace = (new Workspace())
            ->setName('The Daily Grind')
            ->setOwner((new User())->setEmail('owner@dailybrew.work'));

        ['entity' => $token] = ApiToken::create($workspace, 'Turnstile');
        $token->setSigningSecretEncrypted($this->cipher->encrypt(self::SECRET));

        // publicId is generated in the constructor; the tests need a known one.
        $reflection = new \ReflectionProperty(ApiToken::class, 'publicId');
        $reflection->setValue($token, $publicId);

        return $token;
    }

    /**
     * Builds a request signed over one set of values but *sent* with another,
     * so a test can tamper with exactly one component.
     */
    private function signedRequest(
        ?int $timestamp = null,
        string $nonce = 'nonce-0123456789',
        string $keyId = 'testkey00001',
        ?string $sendBody = null,
        ?string $sendPath = null,
    ): Request {
        $timestamp ??= DateService::now()->getTimestamp();
        $signature = RequestSignature::sign(self::SECRET, $timestamp, $nonce, 'POST', self::PATH, self::BODY);

        $request = Request::create($sendPath ?? self::PATH, 'POST', server: [], content: $sendBody ?? self::BODY);
        $request->headers->set(RequestSignature::HEADER_KEY_ID, $keyId);
        $request->headers->set(RequestSignature::HEADER_TIMESTAMP, (string) $timestamp);
        $request->headers->set(RequestSignature::HEADER_NONCE, $nonce);
        $request->headers->set(RequestSignature::HEADER_SIGNATURE, $signature);

        return $request;
    }
}

<?php

declare(strict_types=1);

namespace App\Service\Integration;

use App\Entity\ApiToken;
use App\Exception\InvalidSignedRequestException;
use App\Repository\ApiTokenRepository;
use App\Service\DateService;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Verifies a signed write request and returns the key that signed it.
 *
 * Order matters and is not an accident:
 *
 *  1. resolve the key      — cheap, and everything else needs it
 *  2. check the clock skew — cheapest rejection, before any crypto
 *  3. check the signature  — a forger must clear this before learning anything
 *  4. check the nonce      — only a *valid* signature can burn a nonce, so an
 *                            attacker can't exhaust the replay cache with junk
 *
 * Every failure raises the same exception with the same public message; the
 * specific reason is logged for operators.
 */
final readonly class SignedRequestVerifier
{
    /** How far a request's timestamp may sit from server time, in seconds. */
    public const int MAX_SKEW_SECONDS = 300;

    /** Replay window. Twice the skew, so a nonce outlives every request that could still be valid. */
    private const int NONCE_TTL_SECONDS = 600;

    public function __construct(
        private ApiTokenRepository $apiTokenRepository,
        private SecretCipher $cipher,
        private CacheItemPoolInterface $integrationNoncePool,
        private LoggerInterface $logger,
    ) {
    }

    /**
     * @throws InvalidSignedRequestException on any verification failure
     */
    public function verify(Request $request): ApiToken
    {
        $keyId = (string) $request->headers->get(RequestSignature::HEADER_KEY_ID, '');
        $timestamp = (string) $request->headers->get(RequestSignature::HEADER_TIMESTAMP, '');
        $nonce = (string) $request->headers->get(RequestSignature::HEADER_NONCE, '');
        $signature = (string) $request->headers->get(RequestSignature::HEADER_SIGNATURE, '');

        if ($keyId === '' || $timestamp === '' || $nonce === '' || $signature === '') {
            throw $this->reject('missing signing headers');
        }
        if (strlen($nonce) < RequestSignature::MIN_NONCE_LENGTH) {
            throw $this->reject('nonce shorter than the minimum');
        }
        if (!preg_match('/^-?\d{1,12}$/', $timestamp)) {
            throw $this->reject('timestamp is not an integer');
        }

        $token = $this->apiTokenRepository->findActiveByPublicId($keyId);
        if ($token === null) {
            throw $this->reject(sprintf('unknown or revoked key id "%s"', $keyId));
        }
        if ($token->getWorkspace()->getDeletedAt() !== null) {
            throw $this->reject('key belongs to a deleted workspace');
        }

        $skew = abs(DateService::now()->getTimestamp() - (int) $timestamp);
        if ($skew > self::MAX_SKEW_SECONDS) {
            throw $this->reject(sprintf('timestamp is %ds outside the accepted window', $skew));
        }

        $secret = $token->getSigningSecretEncrypted();
        if ($secret === null) {
            // Minted before signing existed. It can still read; it can never sign.
            throw $this->reject('key has no signing secret — re-mint it to sign requests');
        }

        try {
            $plainSecret = $this->cipher->decrypt($secret);
        } catch (\RuntimeException $e) {
            // Wrong encryption key or a tampered row. Fail closed and make it loud
            // in the log: this one is an operator problem, not an attacker.
            $this->logger->error('API token signing secret could not be decrypted.', [
                'keyId' => $keyId,
                'error' => $e->getMessage(),
            ]);
            throw $this->reject('signing secret could not be decrypted');
        }

        $expected = RequestSignature::sign(
            $plainSecret,
            (int) $timestamp,
            $nonce,
            $request->getMethod(),
            $request->getPathInfo(),
            $request->getContent(),
        );

        if (!RequestSignature::matches($expected, $signature)) {
            throw $this->reject('signature mismatch');
        }

        $this->assertNonceUnused($keyId, $nonce);

        return $token;
    }

    /**
     * Burn the nonce, rejecting one we've already seen for this key.
     *
     * Read-then-write rather than an atomic compare-and-set: PSR-6 has no CAS,
     * and the window this leaves is two identical requests arriving inside the
     * same few milliseconds. That is worth knowing about but not worth a Redis
     * dependency — the unique `(employee, date)` constraint stops a duplicate
     * write from landing twice anyway.
     */
    private function assertNonceUnused(string $keyId, string $nonce): void
    {
        $key = sprintf('integration_nonce.%s.%s', $keyId, hash('sha256', $nonce));

        try {
            $item = $this->integrationNoncePool->getItem($key);
        } catch (\Psr\Cache\InvalidArgumentException) {
            throw $this->reject('nonce could not be checked');
        }

        if ($item->isHit()) {
            throw $this->reject('nonce already used');
        }

        $item->set(true);
        $item->expiresAfter(self::NONCE_TTL_SECONDS);
        $this->integrationNoncePool->save($item);
    }

    private function reject(string $reason): InvalidSignedRequestException
    {
        $this->logger->warning('Rejected signed API request: {reason}', ['reason' => $reason]);

        return new InvalidSignedRequestException($reason);
    }
}

<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\ApiToken;
use App\Exception\InvalidSignedRequestException;
use App\Repository\ApiTokenRepository;
use App\Service\DateService;
use App\Service\Integration\RequestSignature;
use App\Service\Integration\SignedRequestVerifier;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

/**
 * Authenticates external integration requests. Two modes, one authenticator:
 *
 *  - **Bearer** (`X-Api-Key`) — the original BasilBook scheme. The token itself
 *    travels on every request, so a captured request is replayable until the
 *    key is revoked. Acceptable for reads, which is all it may do.
 *  - **Signed** (`X-DB-Key-Id` + signature) — the secret never travels and a
 *    captured request expires. Required for anything that writes.
 *
 * Both resolve to the same thing: the workspace and the ApiToken, stamped on
 * the request for downstream controllers to authorise against.
 *
 * Formerly BasilBookApiKeyAuthenticator; renamed when the surface stopped being
 * BasilBook-specific. The `basilbook` routes are unchanged.
 */
class ApiTokenAuthenticator extends AbstractAuthenticator
{
    /** Request attribute carrying the resolved workspace. Kept for BC with the BasilBook controller. */
    public const string ATTR_WORKSPACE = '_basilbook_workspace';

    /** Request attribute carrying the resolved token, so controllers can check scopes. */
    public const string ATTR_TOKEN = '_api_token';

    /** True when the request authenticated by signature rather than bearer token. */
    public const string ATTR_SIGNED = '_api_token_signed';

    public function __construct(
        private readonly ApiTokenRepository $apiTokenRepository,
        private readonly SignedRequestVerifier $signedRequestVerifier,
    ) {}

    public function supports(Request $request): ?bool
    {
        return $request->headers->has('X-Api-Key')
            || $request->headers->has(RequestSignature::HEADER_SIGNATURE);
    }

    public function authenticate(Request $request): Passport
    {
        // A signature, when present, wins: it's the stronger proof, and letting
        // a bearer header shadow it would let a caller downgrade itself.
        if ($request->headers->has(RequestSignature::HEADER_SIGNATURE)) {
            try {
                $apiToken = $this->signedRequestVerifier->verify($request);
            } catch (InvalidSignedRequestException $e) {
                throw new CustomUserMessageAuthenticationException($e->getMessage());
            }
            $signed = true;
        } else {
            $apiToken = $this->resolveBearer($request);
            $signed = false;
        }

        $workspace = $apiToken->getWorkspace();
        if ($workspace->getDeletedAt() !== null) {
            throw new CustomUserMessageAuthenticationException('Workspace is inactive.');
        }

        $owner = $workspace->getOwner();
        if ($owner === null) {
            throw new CustomUserMessageAuthenticationException('Workspace has no owner.');
        }

        // Track last usage
        $apiToken->setLastUsedAt(DateService::now());
        $this->apiTokenRepository->flush();

        $request->attributes->set(self::ATTR_WORKSPACE, $workspace);
        $request->attributes->set(self::ATTR_TOKEN, $apiToken);
        $request->attributes->set(self::ATTR_SIGNED, $signed);

        return new SelfValidatingPassport(
            new UserBadge($owner->getEmailCanonical()),
        );
    }

    private function resolveBearer(Request $request): ApiToken
    {
        $rawKey = $request->headers->get('X-Api-Key');
        if ($rawKey === null || $rawKey === '') {
            throw new CustomUserMessageAuthenticationException('Missing API key.');
        }

        $hash = ApiToken::hashToken($rawKey);
        $apiToken = $this->apiTokenRepository->findActiveByHash($hash);

        if ($apiToken === null) {
            throw new CustomUserMessageAuthenticationException('Invalid API key.');
        }

        return $apiToken;
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(
            ['error' => true, 'message' => $exception->getMessageKey()],
            Response::HTTP_UNAUTHORIZED,
        );
    }
}

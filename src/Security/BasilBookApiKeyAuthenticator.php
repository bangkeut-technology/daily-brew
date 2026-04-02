<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\ApiToken;
use App\Repository\ApiTokenRepository;
use App\Service\DateService;
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
 * Authenticates BasilBook API requests via the X-Api-Key header.
 *
 * Hashes the incoming token and looks it up in the api_tokens table.
 * Sets the resolved workspace on the request for downstream controllers.
 */
class BasilBookApiKeyAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private ApiTokenRepository $apiTokenRepository,
    ) {}

    public function supports(Request $request): ?bool
    {
        return $request->headers->has('X-Api-Key');
    }

    public function authenticate(Request $request): Passport
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

        // Store workspace on the request so controllers can retrieve it
        $request->attributes->set('_basilbook_workspace', $workspace);

        return new SelfValidatingPassport(
            new UserBadge($owner->getEmailCanonical()),
        );
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

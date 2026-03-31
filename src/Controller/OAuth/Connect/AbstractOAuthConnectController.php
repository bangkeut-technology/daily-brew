<?php

declare(strict_types=1);

namespace App\Controller\OAuth\Connect;

use App\Entity\User;
use App\Enum\OAuthProviderEnum;
use App\Repository\UserRepository;
use App\Security\OAuthAuthenticationService;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\OAuth2ClientInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

abstract class AbstractOAuthConnectController extends AbstractController
{
    private const STATE_COOKIE = 'oauth_state';

    public function __construct(
        protected readonly string                     $client,
        protected readonly OAuthProviderEnum          $provider,
        protected readonly ClientRegistry             $clientRegistry,
        protected readonly OAuthAuthenticationService $authenticationService,
        protected readonly JWTEncoderInterface        $jwtEncoder,
        protected readonly UserRepository             $userRepository,
        protected readonly string                     $redirectRoute = '/console/profile',
    ) {}

    protected function getClient(): OAuth2ClientInterface
    {
        return $this->clientRegistry->getClient($this->client);
    }

    protected function getRedirectRoute(): Response
    {
        return $this->redirect(sprintf('%s?connected=%s', $this->redirectRoute, $this->provider->value));
    }

    /**
     * Initiate: redirect to OAuth provider for authorization.
     */
    public function connect(): Response
    {
        $client = $this->getClient();
        $client->setAsStateless();
        $response = $client->redirect();

        $state = $client->getOAuth2Provider()->getState();
        $response->headers->setCookie(
            Cookie::create(self::STATE_COOKIE, $state, time() + 300, '/', null, false, true, false, Cookie::SAMESITE_LAX),
        );

        return $response;
    }

    /**
     * Disconnect: unlink the provider from the current user.
     */
    public function disconnect(Request $request): Response
    {
        $user = $this->resolveUserFromJwt($request);
        if (!$user) {
            return new JsonResponse(['message' => 'Not authenticated'], 401);
        }

        try {
            $this->authenticationService->disconnect($this->provider, $user);
        } catch (\Exception $e) {
            return new JsonResponse(['message' => $e->getMessage()], 400);
        }

        return new RedirectResponse(sprintf('%s?disconnected=%s', $this->redirectRoute, $this->provider->value));
    }

    /**
     * Callback: provider redirects back here after user consent.
     */
    public function callback(Request $request): Response
    {
        $user = $this->resolveUserFromJwt($request);
        if (!$user) {
            return $this->redirect('/sign-in?error=' . urlencode('You must be signed in to connect an account'));
        }

        $expectedState = $request->cookies->get(self::STATE_COOKIE);
        $actualState = $request->query->get('state') ?? $request->request->get('state');

        if (!$actualState || !$expectedState || !hash_equals($expectedState, $actualState)) {
            return $this->redirect(sprintf('%s?error=%s', $this->redirectRoute, urlencode('Invalid state')));
        }

        $client = $this->getClient();
        $client->setAsStateless();
        $oauthUser = $client->fetchUser();

        try {
            $this->authenticationService->connect(
                provider: $this->provider,
                providerId: $oauthUser->getId(),
                user: $user,
            );
        } catch (\Exception $e) {
            return $this->redirect(sprintf('%s?error=%s', $this->redirectRoute, urlencode($e->getMessage())));
        }

        $response = $this->getRedirectRoute();
        $response->headers->clearCookie(self::STATE_COOKIE, '/');

        return $response;
    }

    protected function resolveUserFromJwt(Request $request): ?User
    {
        $token = $request->cookies->get('BEARER');
        if (!$token) {
            return null;
        }

        try {
            $payload = $this->jwtEncoder->decode($token);
            $email = $payload['username'] ?? '';
            if (empty($email)) {
                return null;
            }
            return $this->userRepository->findOneBy(['emailCanonical' => strtolower($email)]);
        } catch (\Exception) {
            return null;
        }
    }
}

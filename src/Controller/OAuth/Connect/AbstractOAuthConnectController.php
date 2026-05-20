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
    private const LINK_COOKIE = 'OAUTH_LINK';

    public function __construct(
        protected readonly string                     $client,
        protected readonly OAuthProviderEnum          $provider,
        protected readonly ClientRegistry             $clientRegistry,
        protected readonly OAuthAuthenticationService $authenticationService,
        protected readonly JWTEncoderInterface        $jwtEncoder,
        protected readonly UserRepository             $userRepository,
        protected readonly string                     $redirectRoute = '/console/profile',
    ) {}

    /**
     * SameSite=None + Secure so the cookie survives Apple's cross-site POST
     * callback. Path /oauth/connect keeps it off the rest of the site.
     */
    private function setOAuthCookie(Response $response, string $name, string $value, int $maxAge): void
    {
        $response->headers->setCookie(
            Cookie::create(
                name:     $name,
                value:    $value,
                expire:   time() + $maxAge,
                path:     '/oauth/connect',
                domain:   null,
                secure:   true,
                httpOnly: true,
                raw:      false,
                sameSite: Cookie::SAMESITE_NONE,
            ),
        );
    }

    protected function getClient(): OAuth2ClientInterface
    {
        return $this->clientRegistry->getClient($this->client);
    }

    protected function getRedirectRoute(): Response
    {
        return $this->redirect(sprintf('%s?connected=%s', $this->redirectRoute, $this->provider->value));
    }

    /**
     * Initiate: redirect to OAuth provider for authorization. The frontend
     * must have already called /users/me/oauth/link-token so the OAUTH_LINK
     * cookie is present — that's what identifies the user across the
     * cross-site round-trip back from Apple/Google.
     */
    public function connect(Request $request): Response
    {
        if (!$this->resolveUserFromLinkToken($request)) {
            return $this->redirect('/sign-in?error=' . urlencode('You must be signed in to connect an account'));
        }

        $client = $this->getClient();
        $client->setAsStateless();
        $response = $client->redirect();

        $state = $client->getOAuth2Provider()->getState();
        $this->setOAuthCookie($response, self::STATE_COOKIE, $state, 300);

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
        $user = $this->resolveUserFromLinkToken($request);
        if (!$user) {
            return $this->redirect('/sign-in?error=' . urlencode('You must be signed in to connect an account'));
        }

        $expectedState = $request->cookies->get(self::STATE_COOKIE);
        $actualState = $request->query->get('state') ?? $request->request->get('state');

        if (!$actualState || !$expectedState || !hash_equals($expectedState, $actualState)) {
            return $this->clearOAuthCookies($this->redirect(
                sprintf('%s?error=%s', $this->redirectRoute, urlencode('Invalid state')),
            ));
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
            return $this->clearOAuthCookies($this->redirect(
                sprintf('%s?error=%s', $this->redirectRoute, urlencode($e->getMessage())),
            ));
        }

        return $this->clearOAuthCookies($this->getRedirectRoute());
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

    /**
     * Resolve user from the short-lived OAUTH_LINK cookie minted by
     * /users/me/oauth/link-token. Returns null if the cookie is missing,
     * expired, or doesn't match a known user.
     */
    protected function resolveUserFromLinkToken(Request $request): ?User
    {
        $token = $request->cookies->get(self::LINK_COOKIE);
        if (!$token) {
            return null;
        }

        try {
            $payload = $this->jwtEncoder->decode($token);
        } catch (\Exception) {
            return null;
        }

        if (($payload['purpose'] ?? null) !== 'oauth_link') {
            return null;
        }

        $publicId = $payload['sub'] ?? '';
        if (!is_string($publicId) || $publicId === '') {
            return null;
        }

        return $this->userRepository->findOneBy(['publicId' => $publicId]);
    }

    private function clearOAuthCookies(Response $response): Response
    {
        $response->headers->clearCookie(self::STATE_COOKIE, '/oauth/connect', null, true, true, Cookie::SAMESITE_NONE);
        $response->headers->clearCookie(self::LINK_COOKIE, '/oauth/connect', null, true, true, Cookie::SAMESITE_NONE);
        return $response;
    }
}

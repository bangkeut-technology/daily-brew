<?php

declare(strict_types=1);

namespace App\Controller\OAuth\Auth;

use App\Enum\OAuthProviderEnum;
use App\Security\OAuthAuthenticationService;
use App\Security\OAuthUserData;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\OAuth2ClientInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

abstract class AbstractOAuthAuthController extends AbstractController
{
    private const STATE_COOKIE = 'oauth_state';

    public function __construct(
        protected readonly string                     $client,
        protected readonly OAuthProviderEnum          $provider,
        protected readonly ClientRegistry             $clientRegistry,
        protected readonly OAuthAuthenticationService $authenticationService,
        protected readonly string                     $redirectRoute = '/auth/callback',
    ) {}

    protected function getClient(): OAuth2ClientInterface
    {
        return $this->clientRegistry->getClient($this->client);
    }

    protected function getRedirectResponse(): RedirectResponse
    {
        return $this->redirect($this->redirectRoute);
    }

    public function connect(): Response
    {
        $client = $this->getClient();
        $client->setAsStateless();
        $response = $client->redirect();

        // Store state in a cookie instead of the session — the session cookie
        // is unreliable across OAuth redirects in many browser/server combos.
        $state = $client->getOAuth2Provider()->getState();
        $response->headers->setCookie(
            Cookie::create(self::STATE_COOKIE, $state, time() + 300, '/', null, false, true, false, Cookie::SAMESITE_LAX),
        );

        return $response;
    }

    public function callback(Request $request): Response
    {
        try {
            $expectedState = $request->cookies->get(self::STATE_COOKIE);
            $actualState = $request->query->get('state') ?? $request->request->get('state');

            if (!$actualState || !$expectedState || !hash_equals($expectedState, $actualState)) {
                return $this->redirect('/sign-in?error=' . urlencode('Invalid state'));
            }

            $client = $this->getClient();
            $client->setAsStateless();
            $oauthUser = $client->fetchUser();

            $response = $this->getRedirectResponse();

            // Clear the state cookie
            $response->headers->clearCookie(self::STATE_COOKIE, '/');

            $this->authenticationService->authenticate(
                new OAuthUserData(
                    provider: $this->provider,
                    providerId: $oauthUser->getId(),
                    email: strtolower($oauthUser->getEmail() ?? ''),
                    firstName: method_exists($oauthUser, 'getFirstName') ? $oauthUser->getFirstName() : null,
                    lastName: method_exists($oauthUser, 'getLastName') ? $oauthUser->getLastName() : null,
                ),
                $response,
            );

            return $response;
        } catch (\Exception $e) {
            return $this->redirect('/sign-in?error=' . urlencode($e->getMessage()));
        }
    }
}

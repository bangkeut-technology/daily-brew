<?php

declare(strict_types=1);

namespace App\Controller\OAuth\Auth;

use App\Enum\OAuthProviderEnum;
use App\Security\OAuthAuthenticationService;
use App\Security\OAuthUserData;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\OAuth2ClientInterface;
use KnpU\OAuth2ClientBundle\Exception\InvalidStateException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

abstract class AbstractOAuthAuthController extends AbstractController
{
    public function __construct(
        protected readonly string                     $client,
        protected readonly OAuthProviderEnum          $provider,
        protected readonly ClientRegistry             $clientRegistry,
        protected readonly OAuthAuthenticationService $authenticationService,
        protected readonly LoggerInterface            $logger,
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
        return $this->getClient()->redirect();
    }

    public function callback(Request $request): Response
    {
        try {
            $oauthUser = $this->getClient()->fetchUser();

            $response = $this->getRedirectResponse();

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
        } catch (InvalidStateException $e) {
            $session = $request->hasSession() ? $request->getSession() : null;
            $expectedState = $session?->get('knpu.oauth2_client_state');
            $actualState = $request->query->get('state') ?? $request->request->get('state');

            $this->logger->error('OAuth invalid state', [
                'provider' => $this->provider->value,
                'expected_state' => $expectedState ? substr($expectedState, 0, 8) . '...' : 'null',
                'actual_state' => $actualState ? substr($actualState, 0, 8) . '...' : 'null',
                'has_session' => $request->hasSession(),
                'session_id' => $session?->getId() ? substr($session->getId(), 0, 8) . '...' : 'null',
                'has_session_cookie' => $request->cookies->has(session_name()),
            ]);

            return $this->redirect('/sign-in?error=' . urlencode($e->getMessage()));
        } catch (\Exception $e) {
            return $this->redirect('/sign-in?error=' . urlencode($e->getMessage()));
        }
    }
}

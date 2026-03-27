<?php

declare(strict_types=1);

namespace App\Controller\OAuth\Auth;

use App\Enum\OAuthProviderEnum;
use App\Security\OAuthAuthenticationService;
use App\Security\OAuthUserData;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\OAuth2ClientInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

abstract class AbstractOAuthAuthController extends AbstractController
{
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
        return $this->getClient()->redirect();
    }

    public function callback(): Response
    {
        $oauthUser = $this->getClient()->fetchUser();

        $response = $this->getRedirectResponse();

        try {
            $user = $this->authenticationService->authenticate(
                new OAuthUserData(
                    provider: $this->provider,
                    providerId: $oauthUser->getId(),
                    email: strtolower($oauthUser->getEmail() ?? ''),
                    firstName: method_exists($oauthUser, 'getFirstName') ? $oauthUser->getFirstName() : null,
                    lastName: method_exists($oauthUser, 'getLastName') ? $oauthUser->getLastName() : null,
                ),
                $response,
            );

            // Redirect to onboarding if not completed
            if (!$user->isOnboardingCompleted()) {
                return $this->redirect('/onboarding');
            }
        } catch (\Exception $e) {
            return $this->redirect('/sign-in?error=' . urlencode($e->getMessage()));
        }

        return $response;
    }
}

<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 2/7/26 11:28AM
 * @see     https://adora.media
 * Copyright (c) 2026 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\Controller\OAuth\Auth;

use App\Controller\AbstractController;
use App\Enum\OAuthProviderEnum;
use App\Security\OAuthAuthenticationService;
use App\Security\OAuthUserData;
use Exception;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\OAuth2ClientInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 * Abstract class AbstractOAuthAuthController
 *
 * @package App\Controller\OAuth\Auth
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
abstract class AbstractOAuthAuthController extends AbstractController
{
    /**
     * Constructor for the OAuth authentication controller.
     *
     * @param TranslatorInterface        $translator                The translator service for handling localization.
     * @param string                     $client                    The name of the OAuth client being used.
     * @param OAuthProviderEnum          $provider                  The OAuth provider being used.
     * @param ClientRegistry             $clientRegistry            The registry managing OAuth clients.
     * @param OAuthAuthenticationService $authAuthenticationService The service handling OAuth authentication logic.
     * @param string                     $redirectRoute             The route to redirect to after authentication. Defaults to '/auth/callback'.
     */
    public function __construct(
        TranslatorInterface                           $translator,
        protected string                              $client,
        protected OAuthProviderEnum                   $provider,
        protected readonly ClientRegistry             $clientRegistry,
        protected readonly OAuthAuthenticationService $authAuthenticationService,
        protected readonly string                     $redirectRoute = '/auth/callback',
    )
    {
        parent::__construct($translator);
    }

    /**
     * Returns the redirect response for OAuth authentication callbacks.
     *
     * @return RedirectResponse The redirect response object.
     */
    protected function getRedirectResponse(): RedirectResponse
    {
        return $this->redirect($this->redirectRoute);
    }

    /**
     * Returns the OAuth client instance for the specified provider.
     *
     * @return OAuth2ClientInterface The OAuth client instance.
     */
    protected function getClient(): OAuth2ClientInterface
    {
        return $this->clientRegistry->getClient($this->client);
    }

    /**
     * This method handles the OAuth authentication process connecting a user to an existing account.
     *
     * @return Response The HTTP response object.
     */
    public function connect(): Response
    {
        return $this->getClient()->redirect();
    }

    /**
     * This method handles the OAuth authentication callback process after successful authentication.
     *
     * @return Response The HTTP response object.
     */
    public function callback(): Response
    {
        $user = $this->getClient()->fetchUser();

        $response = $this->getRedirectResponse();

        try {
            $this->authAuthenticationService->authenticate(
                new OAuthUserData(
                    provider: $this->provider,
                    providerId: $user->getId(),
                    email: strtolower($user->getEmail()),
                    firstName: $user->getFirstName(),
                    lastName: $user->getLastName(),
                ),
                $response
            );
        } catch (Exception $e) {
            throw $this->createBadRequestException($e->getMessage());
        }

        return $response;
    }
}

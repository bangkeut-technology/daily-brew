<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 2/7/26 11:16 AM
 * @see     https://adora.media
 * Copyright (c) 2026 Adora. All rights reserved.
 */

namespace App\Controller\OAuth\Connect;

use App\Controller\AbstractController;
use App\DTO\UserDTO;
use App\Enum\OAuthProviderEnum;
use App\Security\OAuthAuthenticationService;
use Exception;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Client\OAuth2ClientInterface;
use League\OAuth2\Client\Provider\GoogleUser;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Role\RoleHierarchyInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Vich\UploaderBundle\Templating\Helper\UploaderHelper;

/**
 *
 *  Abstract base controller for OAuth connect flows.
 *
 *   Responsibilities:
 *   - `connect`: Route to call to initiate a connection with an OAuth provider.
 *                   Typically, redirects the user to the provider's authorization page.
 *   - `disconnect`: Route to call to unlink/disconnect a provider from the current user.
 *                   Typically, performs authorization checks and updates user data.
 *   - `callback`: Route the OAuth provider redirects back to after user consent.
 *                   Responsible for handling the provider response, exchanging codes/tokens,
 *                   and completing authentication or account linking.
 *
 *   Implementations should return an instance of
 *   `\Symfony\Component\HttpFoundation\Response` or
 *   `\Symfony\Component\HttpFoundation\RedirectResponse`.
 *
 * @package App\Controller\OAuth\Connect
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
abstract class AbstractOAuthConnectController extends AbstractController
{
    public function __construct(
        TranslatorInterface                           $translator,
        protected readonly string                     $client,
        protected readonly OAuthProviderEnum          $provider,
        protected readonly ClientRegistry             $clientRegistry,
        protected readonly OAuthAuthenticationService $authenticationService,
        protected readonly RoleHierarchyInterface     $roleHierarchy,
        protected readonly UploaderHelper             $uploaderHelper,
        protected readonly string                     $redirectRoute = '/console/profile/connections',
    )
    {
        parent::__construct($translator);
    }

    /**
     * Returns the redirect route with optional query parameters.
     *
     * @param OAuthProviderEnum $provider The OAuth provider for which to generate the redirect route.
     *
     * @return Response The redirect response.
     */
    protected function getRedirectRoute(OAuthProviderEnum $provider): Response
    {
        return $this->redirect(sprintf('%s?%s', $this->redirectRoute, $provider->value));
    }

    /**
     * Returns the OAuth client registry client.
     *
     * @return OAuth2ClientInterface The OAuth client.
     */
    protected function getClient(): OAuth2ClientInterface
    {
        return $this->clientRegistry->getClient($this->client);
    }

    /**
     * Handles the OAuth callback and connects the user.
     *
     * @return Response The redirect response.
     */
    protected function callbackHandler(): Response
    {
        $googleUser = $this->getClient()->fetchUser();

        try {
            $this->authenticationService->connect(
                provider: $this->provider,
                providerId: $googleUser->getId(),
                user: $this->getUser()
            );
        } catch (Exception $e) {
            throw $this->createBadRequestException($e->getMessage());
        }

        return $this->getRedirectRoute($this->provider);
    }

    /**
     * Disconnects the user from the OAuth provider.
     *
     * @return Response The JSON response.
     */
    protected function disconnectHandler(): Response
    {
        $user = $this->getUser();

        try {
            $this->authenticationService->disconnect($this->provider, $user);
        } catch (Exception $e) {
            throw $this->createBadRequestException($e->getMessage());
        }
        $roles = $this->roleHierarchy->getReachableRoleNames($user->getRoles());
        $avatarUrl = $this->uploaderHelper->asset($user, 'imageFile');

        return $this->json([
            'message' => $this->translator->trans('disconnected.oauth_provider', ['%provider%' => $this->provider->value]),
            'user'    => UserDTO::fromEntity(user: $user, roles: $roles, avatarUrl: $avatarUrl),
        ], Response::HTTP_OK);
    }

    /**
     * Establishes a connection with an OAuth provider.
     *
     * @return Response The JSON response.
     */
    abstract public function connect(): Response;

    /**
     * Disconnects the OAuth provider from the current user.
     *
     * @return Response The JSON response.
     */
    abstract public function disconnect(): Response;

    /**
     * Handles the callback from the OAuth provider after user consent.
     *
     * @return Response The redirect response.
     */
    abstract public function callback(): Response;
}

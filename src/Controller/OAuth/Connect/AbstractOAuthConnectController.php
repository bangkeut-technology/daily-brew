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
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
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
     * @return Response The redirect response.
     */
    protected function getRedirectRoute(): Response
    {
        return $this->redirect(sprintf('%s?%s', $this->redirectRoute, $this->provider->value));
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
     * Establishes a connection with an OAuth provider.
     *
     * @return Response The JSON response.
     */
    public function connect(): Response
    {
        return $this->getClient()->redirect();
    }

    /**
     * Disconnects the OAuth provider from the current user.
     *
     * @return Response The JSON response.
     */
    public function disconnect(): Response
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
     * Handles the callback from the OAuth provider after user consent.
     *
     * @return Response The redirect response.
     */
    public function callback(): Response
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

        return $this->getRedirectRoute();
    }
}

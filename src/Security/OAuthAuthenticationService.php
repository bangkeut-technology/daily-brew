<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 2/5/26 9:07PM
 * @see     https://adora.media
 * Copyright (c) 2026 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\Security;

use App\Entity\User;
use App\Enum\OAuthProviderEnum;
use App\Event\User\UserSignedUpEvent;
use App\Repository\UserRepository;
use Exception;
use Gesdinet\JWTRefreshTokenBundle\Generator\RefreshTokenGeneratorInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Psr\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;

/**
 *
 * Class OAuthAuthenticationService
 *
 * @package App\Security
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class OAuthAuthenticationService
{
    public function __construct(
        private UserRepository                 $userRepository,
        private JWTTokenManagerInterface       $jwtManager,
        private RefreshTokenGeneratorInterface $refreshTokenGenerator,
        private EventDispatcherInterface       $eventDispatcher,
    )
    {
    }

    /**
     * Handles user authentication via OAuth.
     *
     * The method:
     * - Attempts to find an existing user using OAuth provider and ID or email.
     * - Links the OAuth account to an existing user when applicable.
     * - Creates a new user if no matching user is found.
     * - Issues a JWT and refresh token for the authenticated user.
     * - Sets cookies for the JWT and refresh token on the response for secure storage.
     *
     * @param OAuthUserData $data     Contains OAuth provider, provider ID, and user information such as email.
     * @param Response      $response The HTTP response to modify with authentication cookies.
     *
     * @return void
     * @throws Exception
     */
    public function authenticate(OAuthUserData $data, Response $response): void
    {
        // 1. Find user
        $user = $this->userRepository->findByOAuth($data->provider, $data->providerId)
            ?? $this->userRepository->findByEmail($data->email);

        // 2. Auto-link if needed
        if ($user && !$user->hasOAuth($data->provider)) {
            $user->linkOAuth($data->provider, $data->providerId);
        }

        $isNewUser = false;
        if (!$user) {
            $user = $this->userRepository->create()
                ->setEmail($data->email)
                ->setFirstName($data->firstName ?? '')
                ->setLastName($data->lastName ?? '')
                ->linkOAuth($data->provider, $data->providerId);
            $isNewUser = true;
        }

        $this->userRepository->updateUser($user);

        if ($isNewUser) {
            $this->eventDispatcher->dispatch(new UserSignedUpEvent($user));
        }

        // 4. Issue tokens
        $jwt = $this->jwtManager->create($user);
        $rt = $this->refreshTokenGenerator->createForUserWithTtl($user, 60 * 60 * 24 * 30);

        // 5. Cookies
        $response->headers->setCookie(Cookie::create('BEARER', $jwt, secure: true));

        $response->headers->setCookie(Cookie::create('refresh_token', $rt->getRefreshToken(), secure: true));
    }

    /**
     * Links an OAuth account to an existing user.
     *
     * The method associates the provided OAuth provider and provider ID with the given user
     * and updates the user's information in the database.
     *
     * @param OAuthProviderEnum $provider The OAuth provider to link.
     * @param string            $providerId The unique identifier from the OAuth account.
     * @param User              $user     The user to link with the provided OAuth account.
     *
     * @return void
     * @throws Exception
     */
    public function connect(OAuthProviderEnum $provider, string $providerId, User $user): void
    {
        if ($this->userRepository->findByOAuth($provider, $providerId)) {
            throw new Exception('OAuth account already connected to another user.');
        }

        $user->linkOAuth($provider, $providerId);

        $this->userRepository->updateUser($user);
    }

    /**
     * Disconnects an OAuth provider from a user account.
     *
     * The method:
     * - Unlinks the specified OAuth provider from the user's account.
     * - Updates the user information in the repository after disconnection.
     *
     * @param OAuthProviderEnum $provider The OAuth provider to be disconnected.
     * @param User              $user     The user from whom the OAuth provider will be unlinked.
     *
     * @return void
     * @throws Exception
     */
    public function disconnect(OAuthProviderEnum $provider, User $user): void
    {
        $user->unlinkOAuth($provider);

        $this->userRepository->updateUser($user);
    }
}

<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\User;
use App\Enum\OAuthProviderEnum;
use App\Repository\UserRepository;
use App\Service\CanonicalizerService;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Http\Authentication\AuthenticationSuccessHandler;
use Symfony\Component\HttpFoundation\Response;

final readonly class OAuthAuthenticationService
{
    public function __construct(
        private UserRepository               $userRepository,
        private AuthenticationSuccessHandler $successHandler,
        private CanonicalizerService         $canonicalizer,
    ) {}

    /**
     * Authenticate via OAuth: find or create user, then set JWT + refresh cookies on the response.
     */
    public function authenticate(OAuthUserData $data, Response $response): User
    {
        $user = $this->userRepository->findByOAuth($data->provider, $data->providerId)
            ?? $this->userRepository->findByEmail($data->email);

        if ($user !== null && !$user->hasOAuth($data->provider)) {
            $user->linkOAuth($data->provider, $data->providerId);
        }

        if ($user === null) {
            $user = new User();
            $user->setEmail($data->email);
            $user->setEmailCanonical($this->canonicalizer->canonicalizeEmail($data->email));
            $user->setFirstName($data->firstName);
            $user->setLastName($data->lastName);
            $user->linkOAuth($data->provider, $data->providerId);
            $this->userRepository->persist($user);
        }

        $this->userRepository->flush();

        // Use Lexik's handler — sets both BEARER and refresh_token cookies
        $authResponse = $this->successHandler->handleAuthenticationSuccess($user);

        // Copy cookies to the redirect response
        foreach ($authResponse->headers->getCookies() as $cookie) {
            $response->headers->setCookie($cookie);
        }

        return $user;
    }

    /**
     * Link an OAuth provider to an existing user.
     */
    public function connect(OAuthProviderEnum $provider, string $providerId, User $user): void
    {
        $existing = $this->userRepository->findByOAuth($provider, $providerId);
        if ($existing !== null && $existing->getId() !== $user->getId()) {
            throw new \InvalidArgumentException('This account is already linked to another user.');
        }

        $user->linkOAuth($provider, $providerId);
        $this->userRepository->flush();
    }

    /**
     * Unlink an OAuth provider from a user.
     */
    public function disconnect(OAuthProviderEnum $provider, User $user): void
    {
        $hasPassword = $user->hasPassword();
        $otherOAuth = match ($provider) {
            OAuthProviderEnum::GOOGLE => $user->hasOAuth(OAuthProviderEnum::APPLE),
            OAuthProviderEnum::APPLE => $user->hasOAuth(OAuthProviderEnum::GOOGLE),
        };

        if (!$hasPassword && !$otherOAuth) {
            throw new \InvalidArgumentException('Cannot disconnect: you need at least one login method.');
        }

        $user->unlinkOAuth($provider);
        $this->userRepository->flush();
    }
}

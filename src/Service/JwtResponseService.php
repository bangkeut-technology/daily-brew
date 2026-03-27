<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Http\Authentication\AuthenticationSuccessHandler;
use Symfony\Component\HttpFoundation\Response;

/**
 * Delegates to Lexik's AuthenticationSuccessHandler which handles:
 * - JWT creation
 * - BEARER cookie (via set_cookies config)
 * - Refresh token cookie (via Gesdinet listener on AUTHENTICATION_SUCCESS event)
 * - Dispatching AuthenticationSuccessEvent for any custom listeners
 */
final readonly class JwtResponseService
{
    public function __construct(
        private AuthenticationSuccessHandler $successHandler,
    ) {}

    public function createAuthResponse(User $user): Response
    {
        return $this->successHandler->handleAuthenticationSuccess($user);
    }
}

<?php

namespace App\Service;

use App\Entity\User;
use Gesdinet\JWTRefreshTokenBundle\Generator\RefreshTokenGeneratorInterface;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;

final readonly class JwtResponseService
{
    private const REFRESH_TOKEN_TTL = 2592000; // 30 days

    public function __construct(
        private JWTTokenManagerInterface $jwtManager,
        private RefreshTokenGeneratorInterface $refreshTokenGenerator,
        private RefreshTokenManagerInterface $refreshTokenManager,
        private int $jwtTokenTtl,
    ) {}

    public function createAuthResponse(User $user): JsonResponse
    {
        $jwt = $this->jwtManager->create($user);

        $refreshToken = $this->refreshTokenGenerator->createForUserWithTtl(
            $user,
            self::REFRESH_TOKEN_TTL,
        );
        $this->refreshTokenManager->save($refreshToken);

        $response = new JsonResponse([
            'token' => $jwt,
            'user' => [
                'publicId' => (string) $user->getPublicId(),
                'email' => $user->getEmail(),
            ],
        ]);

        $response->headers->setCookie(
            Cookie::create('BEARER')
                ->withValue($jwt)
                ->withExpires(time() + $this->jwtTokenTtl)
                ->withPath('/')
                ->withSameSite('lax')
                ->withHttpOnly(true)
                ->withSecure(isset($_SERVER['HTTPS']))
        );

        $response->headers->setCookie(
            Cookie::create('refresh_token')
                ->withValue($refreshToken->getRefreshToken())
                ->withExpires(time() + self::REFRESH_TOKEN_TTL)
                ->withPath('/')
                ->withSameSite('lax')
                ->withHttpOnly(true)
                ->withSecure(isset($_SERVER['HTTPS']))
        );

        return $response;
    }
}

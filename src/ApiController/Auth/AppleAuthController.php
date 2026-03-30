<?php

declare(strict_types=1);

namespace App\ApiController\Auth;

use App\ApiController\Trait\ApiResponseTrait;
use App\Service\AppleTokenVerifier;
use App\Service\AuthService;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Http\Authentication\AuthenticationSuccessHandler;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/auth')]
class AppleAuthController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/apple', name: 'auth_apple', methods: ['POST'])]
    public function apple(
        Request $request,
        AppleTokenVerifier $verifier,
        AuthService $authService,
        AuthenticationSuccessHandler $authenticationSuccessHandler,
    ): Response {
        $data = json_decode($request->getContent(), true);
        $identityToken = $data['identityToken'] ?? '';
        $fallbackEmail = $data['email'] ?? null;

        // Apple only sends the user's name on the very first authorization
        $firstName = $data['firstName'] ?? null;
        $lastName = $data['lastName'] ?? null;

        if (empty($identityToken)) {
            return $this->jsonError('identityToken is required');
        }

        try {
            $verified = $verifier->verify($identityToken);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 401);
        }

        $appleId = $verified['sub'];
        $email = $verified['email'] ?: $fallbackEmail;

        if (empty($email)) {
            return $this->jsonError('Email is required for first-time Apple sign in');
        }

        try {
            $user = $authService->findOrCreateAppleUser($appleId, $email, $firstName, $lastName);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 409);
        }

        return $this->withRefreshTokenInBody(
            $authenticationSuccessHandler->handleAuthenticationSuccess($user),
        );
    }
}

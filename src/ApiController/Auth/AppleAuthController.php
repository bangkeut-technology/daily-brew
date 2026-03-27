<?php

namespace App\ApiController\Auth;

use App\ApiController\Trait\ApiResponseTrait;
use App\Service\AuthService;
use App\Service\JwtResponseService;
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
        AuthService $authService,
        JwtResponseService $jwtResponse,
    ): Response {
        $data = json_decode($request->getContent(), true);
        $identityToken = $data['identityToken'] ?? '';
        $email = $data['email'] ?? null;

        if (empty($identityToken)) {
            return $this->jsonError('identityToken is required');
        }

        $parts = explode('.', $identityToken);
        if (count($parts) !== 3) {
            return $this->jsonError('Invalid Apple identity token', 401);
        }

        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
        if ($payload === null) {
            return $this->jsonError('Invalid Apple identity token payload', 401);
        }

        $appleId = $payload['sub'] ?? '';
        $tokenEmail = $payload['email'] ?? $email ?? '';

        if (empty($appleId)) {
            return $this->jsonError('Invalid Apple identity token: missing sub', 401);
        }

        if (empty($tokenEmail)) {
            return $this->jsonError('Email is required for first-time Apple sign in');
        }

        try {
            $user = $authService->findOrCreateAppleUser($appleId, $tokenEmail);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 409);
        }

        return $jwtResponse->createAuthResponse($user);
    }
}

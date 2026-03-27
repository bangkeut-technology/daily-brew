<?php

declare(strict_types=1);

namespace App\ApiController\Auth;

use App\ApiController\Trait\ApiResponseTrait;
use App\Service\AuthService;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Http\Authentication\AuthenticationSuccessHandler;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/auth')]
class GoogleAuthController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/google', name: 'auth_google', methods: ['POST'])]
    public function google(
        Request $request,
        AuthService $authService,
        AuthenticationSuccessHandler $authenticationSuccessHandler,
        HttpClientInterface $httpClient,
        string $googleClientId,
    ): Response {
        $data = json_decode($request->getContent(), true);
        $idToken = $data['idToken'] ?? '';

        if (empty($idToken)) {
            return $this->jsonError('idToken is required');
        }

        $response = $httpClient->request('GET', 'https://oauth2.googleapis.com/tokeninfo', [
            'query' => ['id_token' => $idToken],
        ]);

        if ($response->getStatusCode() !== 200) {
            return $this->jsonError('Invalid Google token', 401);
        }

        $googlePayload = $response->toArray();
        $googleId = $googlePayload['sub'] ?? '';
        $email = $googlePayload['email'] ?? '';
        $aud = $googlePayload['aud'] ?? '';

        if (empty($googleId) || empty($email)) {
            return $this->jsonError('Invalid Google token payload', 401);
        }

        if ($aud !== $googleClientId) {
            return $this->jsonError('Google token audience mismatch', 401);
        }

        try {
            $user = $authService->findOrCreateGoogleUser($googleId, $email);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 409);
        }

        return $authenticationSuccessHandler->handleAuthenticationSuccess($user);
    }
}

<?php

namespace App\ApiController\Auth;

use App\ApiController\Trait\ApiResponseTrait;
use App\Service\AuthService;
use App\Service\JwtResponseService;
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
        JwtResponseService $jwtResponse,
        HttpClientInterface $httpClient,
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

        if (empty($googleId) || empty($email)) {
            return $this->jsonError('Invalid Google token payload', 401);
        }

        try {
            $user = $authService->findOrCreateGoogleUser($googleId, $email);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 409);
        }

        return $jwtResponse->createAuthResponse($user);
    }
}

<?php

namespace App\ApiController\Profile;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Service\AuthService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/profile/connect')]
class ProfileConnectController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/google', name: 'profile_connect_google', methods: ['POST'])]
    public function connectGoogle(
        Request $request,
        #[CurrentUser] User $user,
        AuthService $authService,
        HttpClientInterface $httpClient,
    ): JsonResponse {
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

        if (empty($googleId)) {
            return $this->jsonError('Invalid Google token payload', 401);
        }

        try {
            $authService->connectGoogle($user, $googleId);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 409);
        }

        return $this->jsonSuccess(['message' => 'Google account linked']);
    }

    #[Route('/google', name: 'profile_disconnect_google', methods: ['DELETE'])]
    public function disconnectGoogle(
        #[CurrentUser] User $user,
        AuthService $authService,
    ): JsonResponse {
        try {
            $authService->disconnectGoogle($user);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage());
        }

        return $this->jsonSuccess(['message' => 'Google account unlinked']);
    }

    #[Route('/apple', name: 'profile_connect_apple', methods: ['POST'])]
    public function connectApple(
        Request $request,
        #[CurrentUser] User $user,
        AuthService $authService,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $identityToken = $data['identityToken'] ?? '';

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

        if (empty($appleId)) {
            return $this->jsonError('Invalid Apple identity token: missing sub', 401);
        }

        try {
            $authService->connectApple($user, $appleId);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 409);
        }

        return $this->jsonSuccess(['message' => 'Apple account linked']);
    }

    #[Route('/apple', name: 'profile_disconnect_apple', methods: ['DELETE'])]
    public function disconnectApple(
        #[CurrentUser] User $user,
        AuthService $authService,
    ): JsonResponse {
        try {
            $authService->disconnectApple($user);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage());
        }

        return $this->jsonSuccess(['message' => 'Apple account unlinked']);
    }

    #[Route('', name: 'profile_connections', methods: ['GET'])]
    public function connections(
        #[CurrentUser] User $user,
    ): JsonResponse {
        return $this->jsonSuccess([
            'hasPassword' => $user->getPassword() !== null,
            'googleConnected' => $user->getGoogleId() !== null,
            'appleConnected' => $user->getAppleId() !== null,
        ]);
    }
}

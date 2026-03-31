<?php

declare(strict_types=1);

namespace App\ApiController\Device;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Repository\DeviceTokenRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class DeviceController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/devices', name: 'device_register', methods: ['POST'])]
    public function register(
        Request $request,
        #[CurrentUser] User $user,
        DeviceTokenRepository $deviceTokenRepository,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];

        $token = isset($data['token']) ? trim((string) $data['token']) : '';
        $platform = isset($data['platform']) ? trim((string) $data['platform']) : '';

        if ($token === '') {
            throw new BadRequestHttpException('Token is required');
        }

        if (!in_array($platform, ['ios', 'android', 'web'], true)) {
            throw new BadRequestHttpException('Platform must be one of: ios, android, web');
        }

        $existing = $deviceTokenRepository->findByToken($token);

        if ($existing !== null) {
            // Re-assign to current user if token was registered by another user
            $existing->setUser($user);
            $existing->setPlatform($platform);
            $deviceTokenRepository->update($existing);

            return $this->jsonSuccess([
                'publicId' => $existing->getPublicId(),
                'token' => $existing->getToken(),
                'platform' => $existing->getPlatform(),
            ]);
        }

        $deviceToken = $deviceTokenRepository->create();
        $deviceToken->setToken($token);
        $deviceToken->setPlatform($platform);
        $deviceToken->setUser($user);
        $deviceTokenRepository->update($deviceToken);

        return $this->jsonCreated([
            'publicId' => $deviceToken->getPublicId(),
            'token' => $deviceToken->getToken(),
            'platform' => $deviceToken->getPlatform(),
        ]);
    }

    #[Route('/devices/{token}', name: 'device_unregister', methods: ['DELETE'])]
    public function unregister(
        string $token,
        #[CurrentUser] User $user,
        DeviceTokenRepository $deviceTokenRepository,
    ): JsonResponse {
        $deviceToken = $deviceTokenRepository->findByUserAndToken($user, $token);

        if ($deviceToken === null) {
            throw new NotFoundHttpException('Device token not found');
        }

        $deviceTokenRepository->delete($deviceToken);

        return $this->jsonNoContent();
    }
}

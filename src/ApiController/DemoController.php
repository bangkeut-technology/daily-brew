<?php

declare(strict_types=1);

namespace App\ApiController;

use App\Controller\AbstractController;
use App\Repository\DemoSessionRepository;
use App\Repository\UserRepository;
use App\Seeder\DemoSeeder;
use DateMalformedStringException;
use DateTimeImmutable;
use Random\RandomException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class DemoController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/demo', name: 'demo_')]
class DemoController extends AbstractController
{
    public function __construct(
        TranslatorInterface                    $translator,
        private readonly DemoSessionRepository $demoSessionRepository,
        private readonly UserRepository        $userRepository,
        private readonly Security              $security, private readonly DemoSeeder $demoSeeder
    )
    {
        parent::__construct($translator);
    }

    /**
     * @throws DateMalformedStringException
     * @throws RandomException
     */
    #[Route('/start', name: 'start', methods: ['POST'])]
    public function start(Request $request): JsonResponse
    {
        $payload = $request->getPayload()->all();
        $deviceId = (string)($payload['deviceId'] ?? '');
        if ($deviceId === '') {
            return new JsonResponse(['error' => 'deviceId required'], 400);
        }

        $now = new DateTimeImmutable();
        $session = $this->demoSessionRepository->findActiveDeviceId($deviceId);

        if ($session && $session->getExpiresAt() > $now) {
            // Reuse: authenticate existing user (creates/refreshes session cookie)
            $this->security->login($session->getUser());
            return new JsonResponse(['demo' => true], Response::HTTP_OK);
        }

        $session?->setActive(false);

        // Create fresh demo user/org
        $user = $this->userRepository->create();
        $user->setEmail(sprintf('demo+%s@dailybrew.app', bin2hex(random_bytes(4))))
            ->setRoles(['ROLE_DEMO']);
        $this->userRepository->updateUser($user);

        $this->demoSeeder->seedFor($user);

        // Store session record (e.g., 2h TTL)
        $demo = $this->demoSessionRepository->create();
        $demo->setDeviceId($deviceId)
            ->setUser($user)
            ->setExpiresAt($now->modify('+1 days'))
            ->setActive(true);
        $this->demoSessionRepository->update($demo);

        // Authenticate -> creates Symfony session and cookie
        $this->security->login($user);

        return new JsonResponse(['demo' => true], Response::HTTP_CREATED);
    }
}

<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DemoController extends AbstractController
{
    #[Route('/demo/start', name: 'demo_start', methods: ['POST'])]
    public function start(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent() ?: '{}', true);
        $deviceId = (string)($payload['deviceId'] ?? '');
        if ($deviceId === '') {
            return new JsonResponse(['error' => 'deviceId required'], 400);
        }

        $now = new \DateTimeImmutable();
        $repo = $this->em->getRepository(DemoSession::class);
        $session = $repo->findOneBy(['deviceId' => $deviceId, 'active' => true]);

        if ($session && $session->getExpiresAt() > $now) {
            // Reuse: authenticate existing user (creates/refreshes session cookie)
            $this->userAuthenticator->authenticateUser($session->getUser(), $this->authenticator, $request);
            return new JsonResponse(['demo' => true], 204);
        }

        if ($session) {
            $session->setActive(false);
        }

        // Create fresh demo user/org
        $user = (new User())
            ->setEmail(sprintf('demo+%s@dailybrew.app', bin2hex(random_bytes(4))))
            ->setRoles(['ROLE_DEMO']);
        // If your user requires a password field, set a random one; not used for login here
        // $user->setPassword($passwordHasher->hashPassword($user, bin2hex(random_bytes(6))));
        $this->em->persist($user);

        $org = (new Organization())
            ->setName('DailyBrew Demo')
            ->setIsDummy(true);
        $org->addMember($user);
        $this->em->persist($org);

        // Seed data
        $this->seeder->seedFor($org, $user);

        // Store session record (e.g., 2h TTL)
        $demo = (new DemoSession())
            ->setDeviceId($deviceId)
            ->setUser($user)
            ->setExpiresAt($now->modify('+2 hours'))
            ->setActive(true);
        $this->em->persist($demo);

        $this->em->flush();

        // Authenticate -> creates Symfony session + cookie
        $this->userAuthenticator->authenticateUser($user, $this->authenticator, $request);

        return new JsonResponse(['demo' => true], 201);
    }
}

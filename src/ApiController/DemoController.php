<?php

declare(strict_types=1);

namespace App\ApiController;

use App\Controller\AbstractController;
use App\Enum\UserRoleEnum;
use App\Repository\DemoSessionRepository;
use App\Seeder\DemoSeeder;
use App\Util\UserManipulatorInterface;
use DateMalformedStringException;
use DateTimeImmutable;
use Faker\Factory;
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
        TranslatorInterface                       $translator,
        private readonly DemoSessionRepository    $demoSessionRepository,
        private readonly UserManipulatorInterface $userManipulator,
        private readonly Security                 $security,
        private readonly DemoSeeder               $demoSeeder
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
            return $this->json(['message' => 'deviceId required'], Response::HTTP_BAD_REQUEST);
        }

        $now = new DateTimeImmutable();
        $session = $this->demoSessionRepository->findActiveDeviceId($deviceId);
        if ($session && $session->getExpiresAt() > $now) {
            $this->security->login($session->getUser(), 'json_login', 'console_area');
            return $this->createDemoSessionResponse(['demoSession' => $session, 'message' => 'Demo session found']);
        }

        $faker = Factory::create();

        $user = $this->userManipulator->create(
            sprintf('demo+%s@dailybrew.app', bin2hex(random_bytes(4))),
            $faker->password(),
            $faker->firstName(),
            $faker->lastName(),
            UserRoleEnum::DEMO,
        );

        $this->demoSeeder->seedFor($user);

        $demo = $this->demoSessionRepository->create();
        $demo->setDeviceId($deviceId)
            ->setUser($user)
            ->setExpiresAt($now->modify('+1 days'))
            ->setActive(true);
        $this->demoSessionRepository->update($demo);

        $this->security->login($user, 'json_login', 'console_area');

        return $this->createDemoSessionResponse(['demoSession' => $demo, 'message' => 'Demo session have been created'], Response::HTTP_CREATED);
    }

    /**
     * Prepares and returns a JSON response for a demo session.
     *
     * @param mixed $data       The data to be serialized into the JSON response.
     * @param int   $statusCode The HTTP status code of the response. Defaults to Response::HTTP_OK.
     *
     * @return JsonResponse The JSON response object.
     */
    private function createDemoSessionResponse(mixed $data, int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return $this->json($data, $statusCode, context: ['groups' => ['demo_session:read', 'user:read']]);
    }
}

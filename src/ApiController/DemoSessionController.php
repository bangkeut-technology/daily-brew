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
use OpenApi\Attributes as OA;
use Random\RandomException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Target;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class DemoSessionController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/demo-sessions', name: 'demo_sessions_')]
class DemoSessionController extends AbstractController
{
    public function __construct(
        TranslatorInterface                          $translator,
        private readonly DemoSessionRepository       $demoSessionRepository,
        private readonly UserManipulatorInterface    $userManipulator,
        private readonly Security                    $security,
        private readonly DemoSeeder                  $demoSeeder,
        #[Target('anonymous_demo_session.limiter')]
        private readonly RateLimiterFactoryInterface $anonymousLimiter,
    )
    {
        parent::__construct($translator);
    }

    /**
     * Start or refresh a demo session for a device.
     *
     * Cases:
     * - Found & active  -> reuse (login + return existing expiresAt)
     * - Found & expired -> deactivate + wipe old demo data, then create fresh
     * - Not found       -> create fresh
     *
     * @throws DateMalformedStringException
     * @throws RandomException
     */
    #[OA\RequestBody(
        description: 'Start or refresh a demo session for a device',
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'deviceId', description: 'The device ID', type: 'string'),
            ]
        )
    )]
    #[Route('/start', name: 'start', methods: ['POST'])]
    public function start(Request $request): JsonResponse
    {
        $limiter = $this->anonymousLimiter->create($request->getClientIp());

        if (false === $limiter->consume(1)->isAccepted()) {
            throw new TooManyRequestsHttpException();
        }

        $payload = $request->getPayload()->all();
        $deviceId = (string)($payload['deviceId'] ?? '');
        if ($deviceId === '') {
            return $this->json(['message' => 'deviceId required'], Response::HTTP_BAD_REQUEST);
        }

        $now = new DateTimeImmutable();
        $session = $this->demoSessionRepository->findDeviceId($deviceId);
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

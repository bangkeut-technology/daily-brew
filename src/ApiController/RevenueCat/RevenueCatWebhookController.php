<?php

declare(strict_types=1);

namespace App\ApiController\RevenueCat;

use App\Service\RevenueCatWebhookService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class RevenueCatWebhookController extends AbstractController
{
    #[Route('/webhooks/revenuecat', name: 'revenuecat_webhook', methods: ['POST'])]
    public function handle(
        Request $request,
        RevenueCatWebhookService $revenueCatService,
    ): JsonResponse {
        $authHeader = $request->headers->get('Authorization');
        $expectedToken = $this->getParameter('revenuecat_webhook_secret');

        if ($expectedToken && $authHeader !== 'Bearer ' . $expectedToken) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $payload = json_decode($request->getContent(), true);
        if (!$payload) {
            return new JsonResponse(['error' => 'Invalid payload'], 400);
        }

        $revenueCatService->handleEvent($payload);

        return new JsonResponse(['ok' => true]);
    }
}

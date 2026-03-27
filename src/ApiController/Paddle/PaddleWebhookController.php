<?php

namespace App\ApiController\Paddle;

use App\ApiController\Trait\ApiResponseTrait;
use App\Service\PaddleWebhookService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class PaddleWebhookController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/webhooks/paddle', name: 'paddle_webhook', methods: ['POST'])]
    public function webhook(
        Request $request,
        PaddleWebhookService $webhookService,
    ): JsonResponse {
        $signature = $request->headers->get('Paddle-Signature');
        $webhookSecret = $this->getParameter('paddle_webhook_secret');

        // Verify Paddle signature if secret is configured
        if ($webhookSecret && $signature) {
            $rawBody = $request->getContent();
            if (!$this->verifyPaddleSignature($rawBody, $signature, $webhookSecret)) {
                return $this->jsonError('Invalid signature', 403);
            }
        }

        $event = json_decode($request->getContent(), true);
        if ($event === null) {
            return $this->jsonError('Invalid JSON');
        }

        $webhookService->handleEvent($event);

        return $this->jsonSuccess(['received' => true]);
    }

    private function verifyPaddleSignature(string $payload, string $signature, string $secret): bool
    {
        // Parse Paddle signature format: ts=xxx;h1=xxx
        $parts = [];
        foreach (explode(';', $signature) as $part) {
            [$key, $value] = explode('=', $part, 2);
            $parts[$key] = $value;
        }

        $ts = $parts['ts'] ?? '';
        $h1 = $parts['h1'] ?? '';

        if (empty($ts) || empty($h1)) {
            return false;
        }

        $signedPayload = $ts . ':' . $payload;
        $expectedSignature = hash_hmac('sha256', $signedPayload, $secret);

        return hash_equals($expectedSignature, $h1);
    }
}

<?php

namespace App\ApiController\Paddle;

use App\ApiController\Trait\ApiResponseTrait;
use App\Service\PaddleWebhookService;
use Psr\Log\LoggerInterface;
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
        LoggerInterface $logger,
    ): JsonResponse {
        $signature = $request->headers->get('Paddle-Signature');
        $webhookSecret = $this->getParameter('paddle_webhook_secret');
        $rawBody = $request->getContent();

        $logger->info('Paddle webhook received', [
            'has_signature' => !empty($signature),
            'has_secret' => !empty($webhookSecret),
            'body_length' => strlen($rawBody),
        ]);

        // Verify Paddle signature if secret is configured
        if ($webhookSecret && $signature) {
            if (!$this->verifyPaddleSignature($rawBody, $signature, $webhookSecret)) {
                $logger->error('Paddle webhook signature verification failed');
                return $this->jsonError('Invalid signature', 403);
            }
        }

        $event = json_decode($rawBody, true);
        if ($event === null) {
            $logger->error('Paddle webhook invalid JSON', ['body' => substr($rawBody, 0, 500)]);
            return $this->jsonError('Invalid JSON');
        }

        $eventType = $event['event_type'] ?? 'unknown';
        $paddleSubId = $event['data']['id'] ?? null;
        $customData = $event['data']['custom_data'] ?? [];

        $logger->info('Paddle webhook processing', [
            'event_type' => $eventType,
            'subscription_id' => $paddleSubId,
            'custom_data' => $customData,
            'status' => $event['data']['status'] ?? null,
        ]);

        try {
            $webhookService->handleEvent($event);
            $logger->info('Paddle webhook processed successfully', ['event_type' => $eventType]);
        } catch (\Throwable $e) {
            $logger->error('Paddle webhook processing failed', [
                'event_type' => $eventType,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->jsonError('Processing failed: ' . $e->getMessage(), 500);
        }

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

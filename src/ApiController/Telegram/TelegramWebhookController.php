<?php

declare(strict_types=1);

namespace App\ApiController\Telegram;

use App\Service\TelegramService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class TelegramWebhookController extends AbstractController
{
    #[Route('/webhooks/telegram', name: 'telegram_webhook', methods: ['POST'])]
    public function __invoke(
        Request $request,
        TelegramService $telegramService,
        string $telegramWebhookSecret,
    ): JsonResponse {
        $secret = $request->query->getString('secret');

        if ($telegramWebhookSecret === '' || !hash_equals($telegramWebhookSecret, $secret)) {
            return new JsonResponse(['ok' => false], 403);
        }

        $payload = json_decode($request->getContent(), true);
        $message = $payload['message'] ?? null;

        if ($message === null) {
            return new JsonResponse(['ok' => true]);
        }

        $text = $message['text'] ?? '';
        $chatId = (string) ($message['chat']['id'] ?? '');

        if ($chatId === '') {
            return new JsonResponse(['ok' => true]);
        }

        if (str_starts_with($text, '/start') || $text === '/chatid') {
            $telegramService->send(
                $chatId,
                "👋 <b>DailyBrew connected!</b>\n\nYour chat ID is:\n<code>{$chatId}</code>\n\nCopy this ID and paste it in your workspace settings under <b>Telegram notifications</b>.",
            );
        } elseif ($text === '/help') {
            $telegramService->send(
                $chatId,
                "🤖 <b>DailyBrew Bot</b>\n\n/chatid — Show this chat's ID\n/help — Show this message\n\nPaste your chat ID in workspace settings to receive notifications here.",
            );
        }

        return new JsonResponse(['ok' => true]);
    }
}

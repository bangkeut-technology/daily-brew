<?php

declare(strict_types=1);

namespace App\ApiController\Telegram;

use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceSettingRepository;
use App\Entity\WorkspaceSetting;
use App\Service\TelegramLinkTokenService;
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
        TelegramLinkTokenService $tokenService,
        WorkspaceRepository $workspaceRepository,
        WorkspaceSettingRepository $settingRepository,
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

        $text = (string) ($message['text'] ?? '');
        $chatId = (string) ($message['chat']['id'] ?? '');

        if ($chatId === '') {
            return new JsonResponse(['ok' => true]);
        }

        // /start <token> — deep-link flow: link this chat to a workspace.
        if (preg_match('#^/start\s+(\S+)#', $text, $matches) === 1) {
            $this->handleLinkRequest(
                $matches[1],
                $chatId,
                $telegramService,
                $tokenService,
                $workspaceRepository,
                $settingRepository,
            );
            return new JsonResponse(['ok' => true]);
        }

        if ($text === '/start' || $text === '/chatid') {
            $telegramService->send(
                $chatId,
                "👋 <b>DailyBrew</b>\n\nThis chat's ID is:\n<code>{$chatId}</code>\n\nFor a <b>group</b>: paste this ID into your workspace's Telegram settings.\n\nFor a <b>personal</b> chat: open DailyBrew → Settings → Telegram and use <i>Connect personal Telegram</i> for one-click setup.",
            );
        } elseif ($text === '/help') {
            $telegramService->send(
                $chatId,
                "🤖 <b>DailyBrew Bot</b>\n\n/start &lt;token&gt; — Link this chat from the DailyBrew settings page\n/chatid — Show this chat's ID (for group setup)\n/help — Show this message",
            );
        }

        return new JsonResponse(['ok' => true]);
    }

    private function handleLinkRequest(
        string $token,
        string $chatId,
        TelegramService $telegramService,
        TelegramLinkTokenService $tokenService,
        WorkspaceRepository $workspaceRepository,
        WorkspaceSettingRepository $settingRepository,
    ): void {
        $workspacePublicId = $tokenService->verify($token);
        if ($workspacePublicId === null) {
            $telegramService->send(
                $chatId,
                "⚠️ <b>Link expired or invalid</b>\n\nGenerate a new link from DailyBrew → Settings → Telegram.",
            );
            return;
        }

        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            $telegramService->send($chatId, "⚠️ Workspace no longer exists.");
            return;
        }

        $setting = $workspace->getSetting();
        if ($setting === null) {
            $setting = new WorkspaceSetting();
            $setting->setWorkspace($workspace);
            $workspace->setSetting($setting);
            $settingRepository->persist($setting);
        }

        $setting->setTelegramChatId($chatId);
        $setting->setTelegramNotificationsEnabled(true);
        $settingRepository->flush();

        $telegramService->send(
            $chatId,
            sprintf(
                "✅ <b>Connected to %s</b>\n\nYou'll now receive leave requests, shift changes, closures, and daily summaries here.",
                htmlspecialchars($workspace->getName(), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            ),
        );
    }
}

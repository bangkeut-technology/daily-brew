<?php

declare(strict_types=1);

namespace App\ApiController\Telegram;

use App\Entity\WorkspaceSetting;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceSettingRepository;
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
        UserRepository $userRepository,
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

        // /start <token> — deep-link flow: link this chat to a user OR workspace.
        if (preg_match('#^/start\s+(\S+)#', $text, $matches) === 1) {
            $this->handleLinkRequest(
                $matches[1],
                $chatId,
                $telegramService,
                $tokenService,
                $workspaceRepository,
                $settingRepository,
                $userRepository,
            );
            return new JsonResponse(['ok' => true]);
        }

        if ($text === '/start' || $text === '/chatid') {
            $telegramService->send(
                $chatId,
                "👋 <b>DailyBrew</b>\n\nThis chat's ID is:\n<code>{$chatId}</code>\n\nFor a <b>group</b>: paste this ID into your workspace's Telegram settings.\n\nFor a <b>personal</b> chat: open DailyBrew → Profile → Telegram notifications and use <i>Connect personal Telegram</i> for one-click setup.",
            );
        } elseif ($text === '/help') {
            $telegramService->send(
                $chatId,
                "🤖 <b>DailyBrew Bot</b>\n\n/start &lt;token&gt; — Link this chat from the DailyBrew profile or settings page\n/chatid — Show this chat's ID (for group setup)\n/help — Show this message",
            );
        }

        return new JsonResponse(['ok' => true]);
    }

    /**
     * Handle a /start <token> deep-link. We try the user-token shape first
     * (new flow, personal notifications) and fall back to workspace-token
     * (legacy flow, group chat). Both shapes are signed with the app secret;
     * only one of the verify calls will accept any given token because the
     * `user:` prefix is part of the signed payload.
     */
    private function handleLinkRequest(
        string $token,
        string $chatId,
        TelegramService $telegramService,
        TelegramLinkTokenService $tokenService,
        WorkspaceRepository $workspaceRepository,
        WorkspaceSettingRepository $settingRepository,
        UserRepository $userRepository,
    ): void {
        $userPublicId = $tokenService->verifyForUser($token);
        if ($userPublicId !== null) {
            $this->linkUser($userPublicId, $chatId, $telegramService, $userRepository);
            return;
        }

        $workspacePublicId = $tokenService->verify($token);
        if ($workspacePublicId !== null) {
            $this->linkWorkspace($workspacePublicId, $chatId, $telegramService, $workspaceRepository, $settingRepository);
            return;
        }

        $telegramService->send(
            $chatId,
            "⚠️ <b>Link expired or invalid</b>\n\nGenerate a new link from DailyBrew → Profile → Telegram (personal) or Settings → Telegram (group).",
        );
    }

    private function linkUser(
        string $userPublicId,
        string $chatId,
        TelegramService $telegramService,
        UserRepository $userRepository,
    ): void {
        $user = $userRepository->findByPublicId($userPublicId);
        if ($user === null || $user->getDeletedAt() !== null) {
            $telegramService->send($chatId, "⚠️ Account no longer exists.");
            return;
        }

        $user->setTelegramChatId($chatId);
        $userRepository->flush();

        $name = $user->getFirstName() ?: $user->getEmail() ?: 'there';
        $telegramService->send(
            $chatId,
            sprintf(
                "✅ <b>Connected, %s</b>\n\nYou'll now receive your personal DailyBrew notifications here — leave decisions, shift assignments, and (if you're an owner or manager) daily summaries.\n\nManage this connection from DailyBrew → Profile → Telegram notifications.",
                htmlspecialchars($name, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            ),
        );
    }

    private function linkWorkspace(
        string $workspacePublicId,
        string $chatId,
        TelegramService $telegramService,
        WorkspaceRepository $workspaceRepository,
        WorkspaceSettingRepository $settingRepository,
    ): void {
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

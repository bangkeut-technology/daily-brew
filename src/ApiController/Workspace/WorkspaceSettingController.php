<?php

declare(strict_types=1);

namespace App\ApiController\Workspace;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\WorkspaceSetting;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceSettingRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\PlanService;
use App\Service\TelegramLinkTokenService;
use App\Service\TelegramService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/workspaces/{workspacePublicId}/settings')]
class WorkspaceSettingController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'workspace_settings_show', methods: ['GET'])]
    public function show(
        string $workspacePublicId,
        WorkspaceRepository $workspaceRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw $this->createNotFoundException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $setting = $workspace->getSetting();

        return $this->jsonSuccess($this->serializeSetting($setting));
    }

    #[Route('', name: 'workspace_settings_update', methods: ['PUT'])]
    public function update(
        string $workspacePublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        PlanService $planService,
        WorkspaceSettingRepository $settingRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $data = json_decode($request->getContent(), true);
        $setting = $workspace->getSetting();

        // Auto-create setting if none exists
        if ($setting === null) {
            $setting = new WorkspaceSetting();
            $setting->setWorkspace($workspace);
            $workspace->setSetting($setting);
            $settingRepository->persist($setting);
        }

        // IP restriction (Espresso gated)
        if (isset($data['ipRestrictionEnabled']) && $data['ipRestrictionEnabled']) {
            if (!$planService->canUseIpRestriction($workspace)) {
                return $this->jsonError('IP restriction requires the Espresso plan', 402);
            }
            $setting->setIpRestrictionEnabled(true);
        } elseif (isset($data['ipRestrictionEnabled'])) {
            $setting->setIpRestrictionEnabled(false);
        }

        if (array_key_exists('allowedIps', $data)) {
            $setting->setAllowedIps($data['allowedIps']);
        }

        // Device verification (Espresso gated)
        if (isset($data['deviceVerificationEnabled']) && $data['deviceVerificationEnabled']) {
            if (!$planService->canUseDeviceVerification($workspace)) {
                return $this->jsonError('Device verification requires the Espresso plan', 402);
            }
            $setting->setDeviceVerificationEnabled(true);
        } elseif (isset($data['deviceVerificationEnabled'])) {
            $setting->setDeviceVerificationEnabled(false);
        }

        // Geofencing (Espresso gated)
        if (isset($data['geofencingEnabled']) && $data['geofencingEnabled']) {
            if (!$planService->canUseGeofencing($workspace)) {
                return $this->jsonError('Geofencing requires the Espresso plan', 402);
            }
            $setting->setGeofencingEnabled(true);
        } elseif (isset($data['geofencingEnabled'])) {
            $setting->setGeofencingEnabled(false);
        }

        if (array_key_exists('geofencingLatitude', $data)) {
            $setting->setGeofencingLatitude($data['geofencingLatitude'] !== null ? (float) $data['geofencingLatitude'] : null);
        }
        if (array_key_exists('geofencingLongitude', $data)) {
            $setting->setGeofencingLongitude($data['geofencingLongitude'] !== null ? (float) $data['geofencingLongitude'] : null);
        }
        if (array_key_exists('geofencingRadiusMeters', $data)) {
            $radius = $data['geofencingRadiusMeters'] !== null ? max((int) $data['geofencingRadiusMeters'], 50) : null;
            $setting->setGeofencingRadiusMeters($radius);
        }

        // Telegram notifications (Espresso gated)
        if (isset($data['telegramNotificationsEnabled']) && $data['telegramNotificationsEnabled']) {
            if (!$planService->canUseTelegramNotifications($workspace)) {
                return $this->jsonError('Telegram notifications require the Espresso plan', 402);
            }
            $setting->setTelegramNotificationsEnabled(true);
        } elseif (isset($data['telegramNotificationsEnabled'])) {
            $setting->setTelegramNotificationsEnabled(false);
        }

        // Tap check-in (Espresso gated)
        if (isset($data['tapCheckinEnabled']) && $data['tapCheckinEnabled']) {
            if (!$planService->canUseTapCheckin($workspace)) {
                return $this->jsonError('Tap check-in requires the Espresso plan', 402);
            }
            $setting->setTapCheckinEnabled(true);
        } elseif (isset($data['tapCheckinEnabled'])) {
            $setting->setTapCheckinEnabled(false);
        }

        // NFC check-in (Espresso gated)
        if (isset($data['nfcCheckinEnabled']) && $data['nfcCheckinEnabled']) {
            if (!$planService->canUseNfcCheckin($workspace)) {
                return $this->jsonError('NFC check-in requires the Espresso plan', 402);
            }
            $setting->setNfcCheckinEnabled(true);
        } elseif (isset($data['nfcCheckinEnabled'])) {
            $setting->setNfcCheckinEnabled(false);
        }

        if (array_key_exists('telegramChatId', $data)) {
            $chatId = $data['telegramChatId'];
            $setting->setTelegramChatId(is_string($chatId) && $chatId !== '' ? $chatId : null);
        }

        // General settings
        if (isset($data['timezone'])) {
            $setting->setTimezone($data['timezone']);
        }
        if (isset($data['dateFormat'])) {
            $setting->setDateFormat($data['dateFormat']);
        }

        $settingRepository->flush();

        return $this->jsonSuccess($this->serializeSetting($setting));
    }

    #[Route('/my-ip', name: 'workspace_settings_my_ip', methods: ['GET'])]
    public function myIp(
        string $workspacePublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        return $this->jsonSuccess(['ip' => $request->getClientIp()]);
    }

    #[Route('/telegram-link-token', name: 'workspace_settings_telegram_link_token', methods: ['POST'])]
    public function telegramLinkToken(
        string $workspacePublicId,
        WorkspaceRepository $workspaceRepository,
        PlanService $planService,
        TelegramLinkTokenService $tokenService,
        string $telegramBotUsername,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        if (!$planService->canUseTelegramNotifications($workspace)) {
            return $this->jsonError('Telegram notifications require the Espresso plan', 402);
        }

        if ($telegramBotUsername === '') {
            return $this->jsonError('Telegram bot is not configured on the server', 503);
        }

        $token = $tokenService->issue((string) $workspace->getPublicId());

        return $this->jsonSuccess([
            'token' => $token,
            'deepLink' => sprintf('https://t.me/%s?start=%s', $telegramBotUsername, $token),
            'expiresInSeconds' => 600,
        ]);
    }

    #[Route('/telegram-test', name: 'workspace_settings_telegram_test', methods: ['POST'])]
    public function telegramTest(
        string $workspacePublicId,
        WorkspaceRepository $workspaceRepository,
        PlanService $planService,
        TelegramService $telegramService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        if (!$planService->canUseTelegramNotifications($workspace)) {
            return $this->jsonError('Telegram notifications require the Espresso plan', 402);
        }

        $setting = $workspace->getSetting();
        $chatId = $setting?->getTelegramChatId();
        if ($chatId === null || $chatId === '') {
            return $this->jsonError('No Telegram chat is connected. Connect a chat first.', 400);
        }

        $message = sprintf(
            "✅ <b>Test from DailyBrew</b>\n\nWorkspace: <b>%s</b>\n\nIf you can see this, Telegram notifications are working.",
            htmlspecialchars($workspace->getName(), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        );

        $error = $telegramService->sendForResult($chatId, $message);
        if ($error !== null) {
            return $this->jsonError('Telegram rejected the test message: ' . $error, 502);
        }

        return $this->jsonSuccess(['sent' => true]);
    }

    private function serializeSetting(?WorkspaceSetting $setting): array
    {
        return [
            'ipRestrictionEnabled' => $setting?->isIpRestrictionEnabled() ?? false,
            'allowedIps' => $setting?->getAllowedIps(),
            'timezone' => $setting?->getTimezone() ?? 'Asia/Phnom_Penh',
            'dateFormat' => $setting?->getDateFormat() ?? 'DD/MM/YYYY',
            'deviceVerificationEnabled' => $setting?->isDeviceVerificationEnabled() ?? false,
            'geofencingEnabled' => $setting?->isGeofencingEnabled() ?? false,
            'geofencingLatitude' => $setting?->getGeofencingLatitude(),
            'geofencingLongitude' => $setting?->getGeofencingLongitude(),
            'geofencingRadiusMeters' => $setting?->getGeofencingRadiusMeters() ?? 100,
            'telegramNotificationsEnabled' => $setting?->isTelegramNotificationsEnabled() ?? false,
            'telegramChatId' => $setting?->getTelegramChatId(),
            'tapCheckinEnabled' => $setting?->isTapCheckinEnabled() ?? false,
            'nfcCheckinEnabled' => $setting?->isNfcCheckinEnabled() ?? false,
        ];
    }
}

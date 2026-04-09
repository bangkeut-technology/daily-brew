<?php

declare(strict_types=1);

namespace App\ApiController\Workspace;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\WorkspaceSetting;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceSettingRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\PlanService;
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
            throw new NotFoundHttpException('Workspace not found');
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
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\ApiController\Admin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\MobileAppConfig;
use App\Entity\User;
use App\Enum\AdminAuditActionEnum;
use App\Enum\AdminAuditTargetTypeEnum;
use App\Repository\MobileAppConfigRepository;
use App\Service\AdminAuditService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/admin/mobile-app-config')]
class AdminMobileAppConfigController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'admin_mobile_app_config_show', methods: ['GET'])]
    public function show(MobileAppConfigRepository $configRepository): JsonResponse
    {
        $config = $configRepository->getOrCreate();
        return $this->jsonSuccess($this->serialize($config));
    }

    #[Route('', name: 'admin_mobile_app_config_update', methods: ['PUT'])]
    public function update(
        Request $request,
        MobileAppConfigRepository $configRepository,
        AdminAuditService $auditService,
        #[CurrentUser] User $user,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        $config = $configRepository->getOrCreate();

        if (array_key_exists('iosTeamId', $data)) {
            $value = $data['iosTeamId'];
            $config->setIosTeamId(is_string($value) && trim($value) !== '' ? trim($value) : null);
        }
        if (array_key_exists('iosBundleId', $data)) {
            $value = $data['iosBundleId'];
            $config->setIosBundleId(is_string($value) && trim($value) !== '' ? trim($value) : null);
        }
        if (array_key_exists('androidPackage', $data)) {
            $value = $data['androidPackage'];
            $config->setAndroidPackage(is_string($value) && trim($value) !== '' ? trim($value) : null);
        }
        if (array_key_exists('androidSha256Fingerprints', $data)) {
            $value = $data['androidSha256Fingerprints'];
            $fingerprints = null;
            if (is_array($value)) {
                $fingerprints = array_values(array_filter(array_map(
                    fn ($f) => is_string($f) ? strtoupper(trim($f)) : '',
                    $value,
                ), static fn (string $f) => $f !== ''));
            }
            $config->setAndroidSha256Fingerprints($fingerprints);
        }

        $configRepository->flush();

        $auditService->record(
            actor: $user,
            action: AdminAuditActionEnum::UpdateMobileAppConfig,
            targetType: AdminAuditTargetTypeEnum::MobileAppConfig,
            targetPublicId: $config->getPublicId(),
            targetLabel: 'Mobile app config',
        );

        return $this->jsonSuccess($this->serialize($config));
    }

    private function serialize(MobileAppConfig $config): array
    {
        return [
            'iosTeamId' => $config->getIosTeamId(),
            'iosBundleId' => $config->getIosBundleId(),
            'androidPackage' => $config->getAndroidPackage(),
            'androidSha256Fingerprints' => $config->getAndroidSha256Fingerprints() ?? [],
            'iosConfigured' => $config->isIosConfigured(),
            'androidConfigured' => $config->isAndroidConfigured(),
        ];
    }
}

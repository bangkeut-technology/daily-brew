<?php

declare(strict_types=1);

namespace App\ApiController\Admin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\FeatureFlag;
use App\Enum\FeatureFlagEnum;
use App\Repository\FeatureFlagRepository;
use App\Service\FeatureFlagService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/feature-flags')]
class AdminFeatureFlagController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'admin_feature_flags_list', methods: ['GET'])]
    public function list(FeatureFlagService $service): JsonResponse
    {
        $states = $service->all();
        $items = array_map(static function (FeatureFlagEnum $case) use ($states) {
            return [
                'key' => $case->value,
                'label' => $case->label(),
                'description' => $case->description(),
                'enabled' => $states[$case->value] ?? false,
            ];
        }, FeatureFlagEnum::cases());

        return $this->jsonSuccess(['items' => $items]);
    }

    #[Route('/{flagKey}', name: 'admin_feature_flags_update', methods: ['PUT'])]
    public function update(
        string $flagKey,
        Request $request,
        FeatureFlagRepository $repository,
        FeatureFlagService $service,
    ): JsonResponse {
        $flag = FeatureFlagEnum::tryFrom($flagKey);
        if ($flag === null) {
            return $this->jsonError('Unknown feature flag', 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $enabled = (bool) ($data['enabled'] ?? false);

        $row = $repository->findByFlag($flag);
        if ($row === null) {
            $row = new FeatureFlag($flag, $enabled);
            $repository->persist($row);
        } else {
            $row->setEnabled($enabled);
        }
        $repository->flush();
        $service->flushCache();

        return $this->jsonSuccess([
            'key' => $flag->value,
            'label' => $flag->label(),
            'description' => $flag->description(),
            'enabled' => $row->isEnabled(),
        ]);
    }
}

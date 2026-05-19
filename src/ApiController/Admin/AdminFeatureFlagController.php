<?php

declare(strict_types=1);

namespace App\ApiController\Admin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\FeatureFlag;
use App\Enum\FeatureFlagEnum;
use App\Enum\FeatureFlagStageEnum;
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
        $stages = $service->getAllStages();
        $items = array_map(static function (FeatureFlagEnum $case) use ($stages) {
            $stage = $stages[$case->value] ?? $case->defaultStage();
            return [
                'key' => $case->value,
                'label' => $case->label(),
                'description' => $case->description(),
                'stage' => $stage->value,
                'stageLabel' => $stage->label(),
            ];
        }, FeatureFlagEnum::cases());

        return $this->jsonSuccess([
            'items' => $items,
            'stages' => array_map(static fn (FeatureFlagStageEnum $s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'description' => $s->description(),
            ], FeatureFlagStageEnum::cases()),
        ]);
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
        $stageRaw = $data['stage'] ?? null;
        $stage = is_string($stageRaw) ? FeatureFlagStageEnum::tryFrom($stageRaw) : null;
        if ($stage === null) {
            return $this->jsonError('Invalid stage. Expected one of: dev, alpha, beta, release.', 400);
        }

        $row = $repository->findByFlag($flag);
        if ($row === null) {
            $row = new FeatureFlag($flag, $stage);
            $repository->persist($row);
        } else {
            $row->setStage($stage);
        }
        $repository->flush();
        $service->flushCache();

        return $this->jsonSuccess([
            'key' => $flag->value,
            'label' => $flag->label(),
            'description' => $flag->description(),
            'stage' => $row->getStage()->value,
            'stageLabel' => $row->getStage()->label(),
        ]);
    }
}

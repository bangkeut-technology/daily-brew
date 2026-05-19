<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\ApiResponseTrait;
use App\Service\FeatureFlagService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Public read-only endpoint that returns the current state of every
 * feature flag. The web and mobile clients hit this once per session
 * to decide which UI surfaces to show.
 */
class FeatureFlagController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/features', name: 'features_index', methods: ['GET'])]
    public function index(FeatureFlagService $service): JsonResponse
    {
        return $this->jsonSuccess($service->all());
    }
}

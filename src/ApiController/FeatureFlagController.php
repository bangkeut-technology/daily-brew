<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\WorkspaceRepository;
use App\Service\FeatureFlagService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Public read-only endpoint that returns the current state of every
 * feature flag, resolved for the supplied workspace (or globally if
 * no workspace context is provided — anonymous visitors and
 * marketing pages only see release-stage flags).
 *
 *   GET /features                      — anonymous / no workspace
 *   GET /features?workspaceId=<pubId>  — resolved for that workspace
 *
 * Response shape:
 *   {
 *     "flags":  { "<key>": bool, ... },   // every known flag
 *     "stages": { "<key>": "dev|alpha|beta|release", ... } // only visible
 *   }
 *
 * `stages` is intentionally restricted to flags the workspace can see —
 * leaking the existence of a hidden flag would defeat the gate. The
 * frontend pairs the boolean with the stage to render a "Beta" / "Alpha"
 * badge on testing-phase surfaces.
 */
class FeatureFlagController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/features', name: 'features_index', methods: ['GET'])]
    public function index(
        Request $request,
        FeatureFlagService $service,
        WorkspaceRepository $workspaceRepository,
    ): JsonResponse {
        $workspaceId = $request->query->get('workspaceId');
        $workspace = is_string($workspaceId) && $workspaceId !== ''
            ? $workspaceRepository->findByPublicId($workspaceId)
            : null;

        return $this->jsonSuccess($service->resolveAllForWorkspace($workspace));
    }
}

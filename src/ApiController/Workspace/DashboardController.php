<?php

namespace App\ApiController\Workspace;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\DashboardService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

class DashboardController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/workspaces/{workspacePublicId}/dashboard', name: 'dashboard', methods: ['GET'])]
    public function dashboard(
        string $workspacePublicId,
        WorkspaceRepository $workspaceRepository,
        DashboardService $dashboardService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        return $this->jsonSuccess($dashboardService->getTodayStats($workspace));
    }
}

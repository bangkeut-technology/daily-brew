<?php

namespace App\ApiController\Plan;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\PlanService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

class PlanController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/workspaces/{workspacePublicId}/plan', name: 'plan_show', methods: ['GET'])]
    public function show(
        string $workspacePublicId,
        WorkspaceRepository $workspaceRepository,
        PlanService $planService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        return $this->jsonSuccess($planService->getPlanDetails($workspace));
    }
}

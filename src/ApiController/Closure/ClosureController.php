<?php

namespace App\ApiController\Closure;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\ClosurePeriodRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\ClosurePeriodService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/workspaces/{workspacePublicId}/closures')]
class ClosureController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'closures_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        WorkspaceRepository $workspaceRepository,
        ClosurePeriodRepository $closureRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $closures = $closureRepository->findByWorkspace($workspace);

        return $this->jsonSuccess(array_map(fn ($c) => [
            'publicId' => (string) $c->getPublicId(),
            'name' => $c->getName(),
            'startDate' => $c->getStartDate()->format('Y-m-d'),
            'endDate' => $c->getEndDate()->format('Y-m-d'),
            'createdAt' => $c->getCreatedAt()->format('c'),
        ], $closures));
    }

    #[Route('', name: 'closures_create', methods: ['POST'])]
    public function create(
        string $workspacePublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        ClosurePeriodService $closureService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || empty($data['startDate']) || empty($data['endDate'])) {
            return $this->jsonError('Name, startDate, and endDate are required');
        }

        $closure = $closureService->create(
            $workspace,
            $data['name'],
            new \DateTime($data['startDate']),
            new \DateTime($data['endDate']),
        );

        return $this->jsonCreated([
            'publicId' => (string) $closure->getPublicId(),
            'name' => $closure->getName(),
            'startDate' => $closure->getStartDate()->format('Y-m-d'),
            'endDate' => $closure->getEndDate()->format('Y-m-d'),
        ]);
    }

    #[Route('/{publicId}', name: 'closures_update', methods: ['PUT'])]
    public function update(
        string $workspacePublicId,
        string $publicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        ClosurePeriodRepository $closureRepository,
        ClosurePeriodService $closureService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $closure = $closureRepository->findByPublicId($publicId);
        if ($closure === null || $closure->getWorkspace()->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Closure not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $closure);

        $data = json_decode($request->getContent(), true);

        $closure = $closureService->update(
            $closure,
            $data['name'] ?? $closure->getName(),
            isset($data['startDate']) ? new \DateTime($data['startDate']) : $closure->getStartDate(),
            isset($data['endDate']) ? new \DateTime($data['endDate']) : $closure->getEndDate(),
        );

        return $this->jsonSuccess([
            'publicId' => (string) $closure->getPublicId(),
            'name' => $closure->getName(),
            'startDate' => $closure->getStartDate()->format('Y-m-d'),
            'endDate' => $closure->getEndDate()->format('Y-m-d'),
        ]);
    }

    #[Route('/{publicId}', name: 'closures_delete', methods: ['DELETE'])]
    public function delete(
        string $workspacePublicId,
        string $publicId,
        WorkspaceRepository $workspaceRepository,
        ClosurePeriodRepository $closureRepository,
        ClosurePeriodService $closureService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $closure = $closureRepository->findByPublicId($publicId);
        if ($closure === null || $closure->getWorkspace()->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Closure not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::DELETE, $closure);

        $closureService->delete($closure);

        return $this->jsonNoContent();
    }
}

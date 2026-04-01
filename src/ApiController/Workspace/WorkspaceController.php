<?php

namespace App\ApiController\Workspace;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\WorkspaceService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/workspaces')]
class WorkspaceController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'workspaces_list', methods: ['GET'])]
    public function list(
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
    ): JsonResponse {
        $workspaces = $workspaceRepository->findByOwner($user);

        return $this->jsonSuccess(array_map(fn ($w) => [
            'publicId' => (string) $w->getPublicId(),
            'name' => $w->getName(),
            'qrToken' => $w->getQrToken(),
            'createdAt' => $w->getCreatedAt()->format('c'),
        ], $workspaces));
    }

    #[Route('', name: 'workspaces_create', methods: ['POST'])]
    public function create(
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceService $workspaceService,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $name = $data['name'] ?? '';
        $timezone = $data['timezone'] ?? null;

        if (empty($name)) {
            return $this->jsonError('Name is required');
        }

        $workspace = $workspaceService->create($user, $name, $timezone);

        return $this->jsonCreated([
            'publicId' => (string) $workspace->getPublicId(),
            'name' => $workspace->getName(),
            'qrToken' => $workspace->getQrToken(),
            'createdAt' => $workspace->getCreatedAt()->format('c'),
        ]);
    }

    #[Route('/{publicId}', name: 'workspaces_show', methods: ['GET'])]
    public function show(
        string $publicId,
        WorkspaceRepository $workspaceRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($publicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $setting = $workspace->getSetting();

        return $this->jsonSuccess([
            'publicId' => (string) $workspace->getPublicId(),
            'name' => $workspace->getName(),
            'qrToken' => $workspace->getQrToken(),
            'createdAt' => $workspace->getCreatedAt()->format('c'),
            'setting' => $setting ? [
                'ipRestrictionEnabled' => $setting->isIpRestrictionEnabled(),
                'allowedIps' => $setting->getAllowedIps(),
                'timezone' => $setting->getTimezone(),
            ] : null,
        ]);
    }

    #[Route('/{publicId}', name: 'workspaces_update', methods: ['PUT'])]
    public function update(
        string $publicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        WorkspaceService $workspaceService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($publicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $data = json_decode($request->getContent(), true);
        $name = $data['name'] ?? '';

        if (empty($name)) {
            return $this->jsonError('Name is required');
        }

        $workspace = $workspaceService->update($workspace, $name);

        return $this->jsonSuccess([
            'publicId' => (string) $workspace->getPublicId(),
            'name' => $workspace->getName(),
        ]);
    }

    #[Route('/{publicId}', name: 'workspaces_delete', methods: ['DELETE'])]
    public function delete(
        string $publicId,
        WorkspaceRepository $workspaceRepository,
        WorkspaceService $workspaceService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($publicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::DELETE, $workspace);

        $workspaceService->delete($workspace);

        return $this->jsonNoContent();
    }
}

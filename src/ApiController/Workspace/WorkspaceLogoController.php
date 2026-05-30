<?php

declare(strict_types=1);

namespace App\ApiController\Workspace;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\WorkspaceService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Vich\UploaderBundle\Templating\Helper\UploaderHelper;

/**
 * Owner-only logo upload. Multipart only — keep WorkspaceController's JSON
 * update endpoint untouched so we never mix content types on the same route.
 *
 * WorkspaceVoter::EDIT on a Workspace subject is owner-only, matching every
 * other workspace-mutating endpoint (settings, QR token rotation, delete).
 * Workspace-wide managers can't touch the logo because branding is the
 * owner's call.
 */
#[Route('/workspaces/{publicId}/logo')]
class WorkspaceLogoController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'workspaces_logo_upload', methods: ['POST'])]
    public function upload(
        string $publicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        WorkspaceService $workspaceService,
        UploaderHelper $uploaderHelper,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($publicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $file = $request->files->get('file');
        if ($file === null) {
            return $this->jsonError('No file uploaded (expected multipart field "file").');
        }

        try {
            $workspace = $workspaceService->uploadLogo($workspace, $file);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 400);
        }

        return $this->jsonSuccess([
            'publicId' => (string) $workspace->getPublicId(),
            'logoUrl' => $uploaderHelper->asset($workspace, 'imageFile'),
        ]);
    }

    #[Route('', name: 'workspaces_logo_delete', methods: ['DELETE'])]
    public function delete(
        string $publicId,
        WorkspaceRepository $workspaceRepository,
        WorkspaceService $workspaceService,
        UploaderHelper $uploaderHelper,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($publicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $workspaceService->removeLogo($workspace);

        return $this->jsonSuccess([
            'publicId' => (string) $workspace->getPublicId(),
            'logoUrl' => $uploaderHelper->asset($workspace, 'imageFile'),
        ]);
    }
}

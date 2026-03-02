<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\WorkspaceTrait;
use App\Controller\AbstractController;
use App\Enum\ApiErrorCodeEnum;
use App\Form\WorkspaceAllowedIpFormType;
use App\Repository\WorkspaceAllowedIpRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class WorkspaceAllowedIpController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/workspaces/{publicId}/allowed-ips', name: 'workspace_allowed_ips_')]
#[OA\Tag(name: 'Workspace IP')]
class WorkspaceAllowedIpController extends AbstractController
{
    use WorkspaceTrait;

    public function __construct(
        TranslatorInterface                            $translator,
        private readonly WorkspaceRepository          $workspaceRepository,
        private readonly WorkspaceAllowedIpRepository $allowedIpRepository,
    )
    {
        parent::__construct($translator);
    }

    #[Route(name: 'list', methods: ['GET'])]
    public function list(string $publicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_ALLOWED_IPS, $workspace);

        $ips = $this->allowedIpRepository->findBy(['workspace' => $workspace, 'deletedAt' => null]);

        return $this->json($ips, Response::HTTP_OK, [], ['groups' => ['workspace_allowed_ip:read']]);
    }

    #[Route(name: 'create', methods: ['POST'])]
    public function create(string $publicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_ALLOWED_IPS, $workspace);

        $allowedIp = $this->allowedIpRepository->create();
        $allowedIp->setWorkspace($workspace);

        $form = $this->createForm(WorkspaceAllowedIpFormType::class, $allowedIp);
        $form->submit($request->getPayload()->all());

        if ($form->isSubmitted() && $form->isValid()) {
            $this->allowedIpRepository->update($allowedIp);

            return $this->json($allowedIp, Response::HTTP_CREATED, [], ['groups' => ['workspace_allowed_ip:read']]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.workspace_allowed_ip', domain: 'errors'));
    }

    #[Route('/{ipPublicId}', name: 'update', methods: ['PUT'])]
    public function update(string $publicId, string $ipPublicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_ALLOWED_IPS, $workspace);

        $allowedIp = $this->allowedIpRepository->findByPublicIdAndWorkspace($ipPublicId, $workspace);
        if (null === $allowedIp) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $ipPublicId]);
        }

        $form = $this->createForm(WorkspaceAllowedIpFormType::class, $allowedIp);
        $form->submit($request->getPayload()->all(), false);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->allowedIpRepository->update($allowedIp);

            return $this->json($allowedIp, Response::HTTP_OK, [], ['groups' => ['workspace_allowed_ip:read']]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.workspace_allowed_ip', domain: 'errors'));
    }

    #[Route('/{ipPublicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId, string $ipPublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_ALLOWED_IPS, $workspace);

        $allowedIp = $this->allowedIpRepository->findByPublicIdAndWorkspace($ipPublicId, $workspace);
        if (null === $allowedIp) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $ipPublicId]);
        }

        $this->allowedIpRepository->delete($allowedIp);

        return $this->json(['message' => 'IP restriction deleted.'], Response::HTTP_OK);
    }
}

<?php
/**
 * This file is part of the DailyBrew project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/9/25 7:13PM
 * @see     https://dailybrew.work
 * Copyright (c) 2025 DailyBrew. All rights reserved.
 */
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\WorkspaceTrait;
use App\Controller\AbstractController;
use App\DTO\WorkspaceUserDTO;
use App\Entity\Workspace;
use App\Enum\ApiErrorCodeEnum;
use App\Enum\WorkspaceRoleEnum;
use App\Factory\DTO\WorkspaceDTOFactory;
use App\Form\WorkspaceFormType;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceUserRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\WorkspaceService;
use App\Service\WorkspaceUserService;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 * Class WorkspaceController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/workspaces', name: 'workspaces_')]
#[OA\Tag(name: 'Workspace')]
class WorkspaceController extends AbstractController
{
    use WorkspaceTrait;

    public function __construct(
        TranslatorInterface                      $translator,
        private readonly WorkspaceRepository     $workspaceRepository,
        private readonly WorkspaceService        $workspaceService,
        private readonly WorkspaceUserRepository $workspaceUserRepository,
        private readonly WorkspaceUserService    $memberService,
        private readonly WorkspaceDTOFactory     $workspaceDTOFactory,
    )
    {
        parent::__construct($translator);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $workspace = new Workspace();
        $form = $this->createForm(WorkspaceFormType::class, $workspace);
        $form->submit($request->toArray());

        if (!$form->isValid()) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::VALIDATION_ERROR, ['form' => (string) $form->getErrors(true)]);
        }

        $result = $this->workspaceService->createWorkspace($this->getUser(), $workspace->getName());

        $dto = $this->workspaceDTOFactory->create($result['workspace'], $result['workspaceUser']);

        return $this->json($dto, Response::HTTP_CREATED);
    }

    #[Route('/{publicId}/members', name: 'members', methods: ['GET'])]
    public function members(string $publicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);

        $members = array_map(
            static fn($member) => WorkspaceUserDTO::fromEntity($member),
            $workspace->getUsers()->toArray(),
        );

        return $this->json($members);
    }

    /**
     * Transfer ownership of a workspace to another user.
     *
     * @param string  $publicId The public identifier of the Workspace.
     * @param Request $request  The HTTP request object.
     *
     * @return JsonResponse The JSON response indicating the result of the operation.
     *
     */
    #[Route('/{publicId}/transfer-ownership', name: 'transfer_ownership', methods: ['POST'])]
    public function transferOwnership(
        string  $publicId,
        Request $request,
    ): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);

        $targetUserPublicId = $request->getPayload()->get('targetUserPublicId');

        if ($targetUserPublicId === '') {
            throw $this->createApiErrorException(
                ApiErrorCodeEnum::VALIDATION_ERROR,
                [
                    'field'   => 'targetUserPublicId',
                    'message' => 'This value should not be blank.',
                ]
            );
        }

        $result = $this->workspaceService->transferOwnership(
            $workspace,
            $this->getUser(),
            $targetUserPublicId
        );

        // Success response
        return $this->json([
            'message' => $this->translator->trans('ownership.transferred'),
            'data'    => $result,
        ]);
    }

    /**
     * Deletes a workspace owned by the authenticated user.
     *
     * @param string $publicId The public identifier of the Workspace.
     *
     * @return JsonResponse A JSON response indicating the success of the operation.
     *
     * @throws NotFoundHttpException If the Workspace is not found or does not belong to the authenticated user.
     */
    #[Route('/{publicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);

        $this->workspaceService->deleteWorkspace($workspace, $this->getUser());

        return new JsonResponse(['message' => 'Workspace deleted successfully'], Response::HTTP_OK);
    }

    #[Route('/{publicId}/members', methods: ['POST'])]
    public function addMember(
        string  $publicId,
        Request $request,
    ): Response
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);

        $this->denyAccessUnlessGranted(WorkspaceVoter::ADD_MEMBER, $workspace);

        $payload = $request->toArray();

        if ('' === $userPublicId = ($payload['userPublicId'] ?? '')) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::BAD_REQUEST, ['user' => 'userPublicId is required.']);
        }

        if ('' === $roleStr = ($payload['role'] ?? '')) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::BAD_REQUEST, ['user' => 'role is required.']);
        }

        $role = WorkspaceRoleEnum::from($roleStr);

        // Enforce role assignment constraint (manager cannot add admin, etc.)
        $employeePublicId = isset($payload['employeePublicId']) ? (string)$payload['employeePublicId'] : null;

        $membership = $this->memberService->addByUserPublicId(
            workspace: $workspace,
            userPublicId: $userPublicId,
            role: $role,
            employeePublicId: $employeePublicId
        );

        return $this->json([
            'message'               => 'Member added.',
            'workspaceUserPublicId' => $membership->publicId,
            'role'                  => $membership->getRole()->value,
        ], 201);
    }
}

<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/9/25 7:13PM
 * @see     https://adora.media
 * Copyright (c) 2025 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\WorkspaceTrait;
use App\Controller\AbstractController;
use App\DTO\WorkspaceUserDTO;
use App\Entity\User;
use App\Enum\ApiErrorCodeEnum;
use App\Repository\WorkspaceRepository;
use App\Service\WorkspaceService;
use OpenApi\Attributes as OA;
use Random\RandomException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
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
        TranslatorInterface                  $translator,
        private readonly WorkspaceRepository $workspaceRepository,
        private readonly WorkspaceService    $workspaceService,
    )
    {
        parent::__construct($translator);
    }

    #[Route('/{publicId}/members', name: 'members', methods: ['GET'])]
    public function members(string $publicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);

        $members = [];
        foreach ($workspace->getUsers() as $member) {
            $user = $member->getUser();
            $members[] = new WorkspaceUserDTO(
                publicId: $member->publicId,
                email: $user->getEmail(),
                fullName: $user->getFullName(),
                role: $member->getRole(),
            );
        }

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
    public function transferOwnership(
        string  $publicId,
        Request $request,
        #[CurrentUser]
        User    $user,
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
            $user,
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
}

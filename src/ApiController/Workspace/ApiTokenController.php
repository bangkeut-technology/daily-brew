<?php

declare(strict_types=1);

namespace App\ApiController\Workspace;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\ApiToken;
use App\Entity\User;
use App\Repository\ApiTokenRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\PlanService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/workspaces/{workspacePublicId}/api-tokens')]
class ApiTokenController extends AbstractController
{
    use ApiResponseTrait;

    /** List all API tokens for this workspace (active + revoked). */
    #[Route('', name: 'api_tokens_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        ApiTokenRepository $apiTokenRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $tokens = $apiTokenRepository->findByWorkspace($workspace);

        return $this->jsonSuccess(array_map(static fn (ApiToken $t) => [
            'publicId' => $t->getPublicId(),
            'name' => $t->getName(),
            'prefix' => $t->getPrefix(),
            'active' => $t->isActive(),
            'lastUsedAt' => $t->getLastUsedAt()?->format('c'),
            'revokedAt' => $t->getRevokedAt()?->format('c'),
            'createdAt' => $t->getCreatedAt()->format('c'),
        ], $tokens));
    }

    /** Generate a new API token. The plain token is returned only in this response. */
    #[Route('', name: 'api_tokens_create', methods: ['POST'])]
    public function create(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        ApiTokenRepository $apiTokenRepository,
        PlanService $planService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        if (!$planService->isAtLeastEspresso($workspace)) {
            return $this->jsonError('API tokens require an Espresso plan.', 403);
        }

        $body = json_decode($request->getContent(), true) ?? [];
        $name = trim((string) ($body['name'] ?? 'BasilBook'));
        if ($name === '') {
            return $this->jsonError('Token name is required.', 422);
        }

        ['entity' => $token, 'plainToken' => $plainToken] = ApiToken::create($workspace, $name);

        $apiTokenRepository->persist($token);
        $apiTokenRepository->flush();

        return $this->jsonCreated([
            'publicId' => $token->getPublicId(),
            'name' => $token->getName(),
            'prefix' => $token->getPrefix(),
            'token' => $plainToken, // Only time the full token is returned
            'createdAt' => $token->getCreatedAt()->format('c'),
        ]);
    }

    /** Revoke an API token. */
    #[Route('/{tokenPublicId}', name: 'api_tokens_revoke', methods: ['DELETE'])]
    public function revoke(
        string $workspacePublicId,
        string $tokenPublicId,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        ApiTokenRepository $apiTokenRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $token = $apiTokenRepository->findOneBy([
            'publicId' => $tokenPublicId,
            'workspace' => $workspace,
        ]);

        if ($token === null) {
            throw new NotFoundHttpException('Token not found');
        }

        if (!$token->isActive()) {
            return $this->jsonError('Token is already revoked.', 409);
        }

        $token->revoke();
        $apiTokenRepository->flush();

        return $this->jsonNoContent();
    }
}

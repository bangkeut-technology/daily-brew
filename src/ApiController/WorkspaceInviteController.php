<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 1/6/26 12:55PM
 *
 * @see     https://adora.media
 */

namespace App\ApiController;

use App\Controller\AbstractController;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceInvite;
use App\Enum\ApiErrorCodeEnum;
use App\Enum\WorkspaceRoleEnum;
use App\Repository\WorkspaceInviteRepository;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceUserRepository;
use App\Security\Voter\WorkspaceInviteVoter;
use App\Service\WorkspaceInviteService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Contracts\Translation\TranslatorInterface;
use ValueError;

/**
 *
 * Class WorkspaceInviteController
 *
 * @package App\ApiController;
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/workspaces/{publicId}/invites', name: 'workspace_invites_')]
class WorkspaceInviteController extends AbstractController
{
    public function __construct(
        TranslatorInterface                        $translator,
        private readonly WorkspaceRepository       $workspaceRepository,
        private readonly WorkspaceInviteRepository $workspaceInviteRepository,
        private readonly WorkspaceInviteService    $workspaceInviteService,
    )
    {
        parent::__construct($translator);
    }

    #[Route(name: 'create', methods: ['POST'])]
    public function create(
        string  $publicId,
        Request $request,
    ): Response
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);

        $this->denyAccessUnlessGranted(WorkspaceInviteVoter::CREATE, $workspace);

        $payload = $request->getPayload();

        $roleStr = (string)($payload['role'] ?? '');
        if ($roleStr === '') {
            throw $this->createApiErrorException(ApiErrorCodeEnum::BAD_REQUEST, ['%field%' => 'role']);
        }

        try {
            $targetRole = WorkspaceRoleEnum::from($roleStr);
        } catch (ValueError) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::BAD_REQUEST, ['%field%' => 'role', '%reason%' => 'Invalid role']);
        }

        $email = isset($payload['email']) ? (string)$payload['email'] : null;
        $employeePublicId = isset($payload['employeePublicId']) ? (string)$payload['employeePublicId'] : null;

        $result = $this->workspaceInviteService->createInvite(
            workspace: $workspace,
            invitedBy: $this->getUser(),
            role: $targetRole,
            email: $email,
            employeePublicId: $employeePublicId,
        );

        $invite = $result['invite'];
        $rawToken = $result['rawToken'];

        return $this->json([
            'publicId'  => $invite->getPublicId(),
            'status'    => $invite->getStatus()->value,
            'expiresAt' => $invite->getExpiresAt()?->format(DATE_ATOM),
            'token'     => $rawToken,
        ], Response::HTTP_CREATED);
    }

    #[Route('/invites', name: 'list', methods: ['GET'])]
    public function list(
        string $publicId,
    ): Response
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceInviteVoter::LIST, $workspace);

        $invites = $this->workspaceInviteRepository->findByWorkspace($workspace);

        return $this->json(array_map(static fn(WorkspaceInvite $invite) => [
            'publicId'   => $invite->publicId,
            'email'      => $invite->getEmail(),
            'role'       => $invite->getRole()->value,
            'status'     => $invite->getStatus()->value,
            'expiresAt'  => $invite->getExpiresAt()?->format(DATE_ATOM),
            'createdAt'  => $invite->getCreatedAt()?->format(DATE_ATOM),
            'acceptedAt' => $invite->getAcceptedAt()?->format(DATE_ATOM),
        ], $invites));
    }

    #[Route('/{invitePublicId}', name: 'revoke', methods: ['DELETE'])]
    public function revoke(
        string               $publicId,
        string               $invitePublicId,
    ): Response
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceInviteVoter::REVOKE, $workspace);

        if (null === $invite = $this->workspaceInviteRepository->findByPublicId($invitePublicId)) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['invite' => 'Invite not found.']);
        }

        $this->workspaceInviteService->revokeInvite($invite);

        return $this->json(['message' => 'Invite revoked.'], Response::HTTP_OK);
    }

    #[Route('/{invitePublicId}', name: 'accept', methods: ['POST'])]
    public function accept(
        Request              $request,
        #[CurrentUser] ?User $user,
    ): Response
    {
        if (!$user) {
            return $this->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $payload = $request->toArray();
        $token = (string)($payload['token'] ?? '');

        if ($token === '') {
            throw $this->createApiErrorException(ApiErrorCodeEnum::VALIDATION_ERROR, ['token' => 'token is required.']);
        }

        $invite = $this->workspaceInviteService->acceptInvite($token, $user);

        return $this->json([
            'message'           => 'Invite accepted.',
            'workspacePublicId' => $invite->getWorkspace()?->publicId,
            'role'              => $invite->getRole()->value,
        ], Response::HTTP_OK);
    }

    /**
     * Retrieves a Workspace entity by its public ID, ensuring it belongs to the authenticated user.
     *
     * @param string $publicId The public identifier of the Workspace.
     *
     * @return Workspace The found Workspace entity.
     *
     * @throws NotFoundHttpException If the Workspace is not found or does not belong to the authenticated user.
     */
    private function getWorkspaceByPublicId(string $publicId): Workspace
    {
        if (null === $workspace = $this->workspaceRepository->findByPublicIdAndUser($publicId, $this->getUser())) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $publicId]);
        }

        return $workspace;
    }
}

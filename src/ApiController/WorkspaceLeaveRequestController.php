<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\WorkspaceTrait;
use App\Controller\AbstractController;
use App\Enum\ApiErrorCodeEnum;
use App\Repository\LeaveRequestRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\LeaveRequestService;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class WorkspaceLeaveRequestController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/workspaces/{publicId}/leave-requests', name: 'workspace_leave_requests_')]
#[OA\Tag(name: 'Leave Requests')]
class WorkspaceLeaveRequestController extends AbstractController
{
    use WorkspaceTrait;

    public function __construct(
        TranslatorInterface                     $translator,
        private readonly WorkspaceRepository    $workspaceRepository,
        private readonly LeaveRequestRepository $leaveRequestRepository,
        private readonly LeaveRequestService    $leaveRequestService,
    ) {
        parent::__construct($translator);
    }

    #[Route(name: 'list', methods: ['GET'])]
    public function list(string $publicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_LEAVE_REQUESTS, $workspace);

        $status = $request->query->get('status');

        if (null !== $status) {
            $requests = $this->leaveRequestRepository->findBy(
                ['workspace' => $workspace, 'status' => $status, 'deletedAt' => null],
                ['createdAt' => 'DESC']
            );
        } else {
            $requests = $this->leaveRequestRepository->findByWorkspace($workspace);
        }

        return $this->json($requests, Response::HTTP_OK, [], ['groups' => ['leave_request:read']]);
    }

    #[Route('/{requestPublicId}/approve', name: 'approve', methods: ['POST'])]
    public function approve(string $publicId, string $requestPublicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_LEAVE_REQUESTS, $workspace);

        $leaveRequest = $this->leaveRequestRepository->findByPublicIdAndWorkspace($requestPublicId, $workspace);
        if (null === $leaveRequest) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $requestPublicId]);
        }

        $note = $request->getPayload()->get('note');
        $this->leaveRequestService->approve($leaveRequest, $this->getUser(), $note);

        return $this->json($leaveRequest, Response::HTTP_OK, [], ['groups' => ['leave_request:read']]);
    }

    #[Route('/{requestPublicId}/reject', name: 'reject', methods: ['POST'])]
    public function reject(string $publicId, string $requestPublicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_LEAVE_REQUESTS, $workspace);

        $leaveRequest = $this->leaveRequestRepository->findByPublicIdAndWorkspace($requestPublicId, $workspace);
        if (null === $leaveRequest) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $requestPublicId]);
        }

        $note = $request->getPayload()->get('note');
        $this->leaveRequestService->reject($leaveRequest, $this->getUser(), $note);

        return $this->json($leaveRequest, Response::HTTP_OK, [], ['groups' => ['leave_request:read']]);
    }
}

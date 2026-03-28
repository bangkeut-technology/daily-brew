<?php

declare(strict_types=1);

namespace App\ApiController\LeaveRequest;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\LeaveRequestDTO;
use App\Entity\User;
use App\Enum\LeaveRequestStatusEnum;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\LeaveRequestService;
use App\Service\PlanService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/workspaces/{workspacePublicId}/leave-requests')]
class LeaveRequestController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'leave_requests_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        LeaveRequestRepository $leaveRequestRepository,
        PlanService $planService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        if (!$planService->canUseLeaveRequests($workspace)) {
            return $this->jsonError('Leave requests require the Espresso plan', 402);
        }

        $status = $request->query->get('status');
        $statusEnum = $status ? LeaveRequestStatusEnum::tryFrom($status) : null;

        $leaveRequests = $leaveRequestRepository->findByWorkspace($workspace, $statusEnum);

        return $this->jsonSuccess(
            array_map(fn ($lr) => LeaveRequestDTO::fromEntity($lr)->toArray(), $leaveRequests),
        );
    }

    #[Route('', name: 'leave_requests_create', methods: ['POST'])]
    public function create(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        LeaveRequestService $leaveRequestService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $data = json_decode($request->getContent(), true);

        if (empty($data['employeePublicId']) || empty($data['startDate']) || empty($data['endDate'])) {
            return $this->jsonError('employeePublicId, startDate, and endDate are required');
        }

        $employee = $employeeRepository->findByPublicId($data['employeePublicId']);
        if ($employee === null || $employee->getWorkspace()?->getId() !== $workspace->getId()) {
            throw $this->createNotFoundException('Employee not found');
        }

        $leaveRequest = $leaveRequestService->create(
            $employee,
            $workspace,
            $user,
            new \DateTime($data['startDate']),
            new \DateTime($data['endDate']),
            $data['reason'] ?? null,
        );

        return $this->jsonCreated(LeaveRequestDTO::fromEntity($leaveRequest)->toArray());
    }

    #[Route('/{publicId}', name: 'leave_requests_update', methods: ['PUT'])]
    public function update(
        string $workspacePublicId,
        string $publicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        LeaveRequestRepository $leaveRequestRepository,
        LeaveRequestService $leaveRequestService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $leaveRequest = $leaveRequestRepository->findByPublicId($publicId);
        if ($leaveRequest === null || $leaveRequest->getEmployee()?->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Leave request not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $leaveRequest);

        $data = json_decode($request->getContent(), true);
        $status = $data['status'] ?? '';

        if ($status === 'approved') {
            $leaveRequest = $leaveRequestService->approve($leaveRequest, $user);
        } elseif ($status === 'rejected') {
            $leaveRequest = $leaveRequestService->reject($leaveRequest, $user, $data['reviewNote'] ?? null);
        } else {
            return $this->jsonError('Status must be "approved" or "rejected"');
        }

        return $this->jsonSuccess(LeaveRequestDTO::fromEntity($leaveRequest)->toArray());
    }
}

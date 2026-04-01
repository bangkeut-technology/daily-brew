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
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        LeaveRequestRepository $leaveRequestRepository,
        EmployeeRepository $employeeRepository,
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

        // Owners and managers see all leave requests; employees see only their own
        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $employee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $isManager = $employee?->isManager() ?? false;
        if (!$isOwner && !$isManager) {
            if ($employee !== null) {
                $employeeId = $employee->getId();
                $leaveRequests = array_filter($leaveRequests, fn ($lr) => $lr->getEmployee()->getId() === $employeeId);
            }
        }

        return $this->jsonSuccess(
            array_values(array_map(fn ($lr) => LeaveRequestDTO::fromEntity($lr)->toArray(), $leaveRequests)),
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

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $data = json_decode($request->getContent(), true);

        if (empty($data['employeePublicId']) || empty($data['startDate']) || empty($data['endDate'])) {
            return $this->jsonError('employeePublicId, startDate, and endDate are required');
        }

        $employee = $employeeRepository->findByPublicId($data['employeePublicId']);
        if ($employee === null || $employee->getWorkspace()?->getId() !== $workspace->getId()) {
            throw $this->createNotFoundException('Employee not found');
        }

        // Owners and managers can submit for any employee; employees only for themselves
        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $currentEmployee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $isManager = $currentEmployee?->isManager() ?? false;
        if (!$isOwner && !$isManager && $employee->getLinkedUser()?->getId() !== $user->getId()) {
            return $this->jsonError('You can only submit leave requests for yourself', 403);
        }

        $startTime = !empty($data['startTime']) ? \DateTimeImmutable::createFromFormat('H:i', $data['startTime']) ?: null : null;
        $endTime = !empty($data['endTime']) ? \DateTimeImmutable::createFromFormat('H:i', $data['endTime']) ?: null : null;

        $leaveRequest = $leaveRequestService->create(
            $employee,
            $workspace,
            $user,
            \App\Service\DateService::mutableParse($data['startDate']),
            \App\Service\DateService::mutableParse($data['endDate']),
            $data['reason'] ?? null,
            $startTime,
            $endTime,
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

        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE, $workspace);

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

    #[Route('/{publicId}', name: 'leave_requests_delete', methods: ['DELETE'])]
    public function delete(
        string $workspacePublicId,
        string $publicId,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        LeaveRequestRepository $leaveRequestRepository,
        EmployeeRepository $employeeRepository,
        \Doctrine\ORM\EntityManagerInterface $em,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $leaveRequest = $leaveRequestRepository->findByPublicId($publicId);
        if ($leaveRequest === null || $leaveRequest->getEmployee()?->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Leave request not found');
        }

        // Owners and managers can cancel any request; employees can only cancel their own pending ones
        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $emp = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $isManager = $emp?->isManager() ?? false;
        if (!$isOwner && !$isManager) {
            if ($leaveRequest->getRequestedBy()?->getId() !== $user->getId()) {
                return $this->jsonError('You can only cancel your own leave requests', 403);
            }
            if ($leaveRequest->getStatus() !== \App\Enum\LeaveRequestStatusEnum::PENDING) {
                return $this->jsonError('Only pending leave requests can be cancelled', 400);
            }
        }

        $leaveRequest->setDeletedAt(\App\Service\DateService::now());
        $em->flush();

        return $this->jsonSuccess(null, 204);
    }
}

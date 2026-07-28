<?php

namespace App\ApiController\Workspace;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Enum\ManagerPermissionEnum;
use App\Repository\EmployeeRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\Dashboard\DashboardTrendService;
use App\Service\DashboardService;
use App\Service\DateService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class DashboardController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/workspaces/{workspacePublicId}/dashboard', name: 'dashboard', methods: ['GET'])]
    public function dashboard(
        string $workspacePublicId,
        WorkspaceRepository $workspaceRepository,
        DashboardService $dashboardService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw $this->createNotFoundException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        return $this->jsonSuccess($dashboardService->getTodayStats($workspace));
    }

    /**
     * Rolling-window attendance trends powering the dashboard charts.
     *
     * Scoped exactly like `/attendances/summary`: owners and managers holding
     * `manage_attendance` get the whole workspace, everyone else gets their own
     * history — so an employee's dashboard can chart their own punctuality
     * without leaking the team's.
     */
    #[Route('/workspaces/{workspacePublicId}/dashboard/trends', name: 'dashboard_trends', methods: ['GET'])]
    public function trends(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        DashboardTrendService $trendService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $days = min(DashboardTrendService::MAX_DAYS, max(1, $request->query->getInt('days', 14)));

        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $selfEmployee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $canSeeAll = $isOwner || ($selfEmployee?->hasManagerPermission(ManagerPermissionEnum::MANAGE_ATTENDANCE) ?? false);

        if ($canSeeAll) {
            // The window reaches back 2x days for the previous-period delta, so
            // employees who left inside that older half still need including.
            $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
            $windowStart = DateService::today($tz)->modify(sprintf('-%d days', 2 * $days - 1));
            $employees = $employeeRepository->findActiveDuringRangeByWorkspace($workspace, $windowStart);
        } else {
            $employees = $selfEmployee !== null ? [$selfEmployee] : [];
        }

        return $this->jsonSuccess($trendService->build($workspace, $employees, $days));
    }
}

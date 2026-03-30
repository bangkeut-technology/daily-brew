<?php

declare(strict_types=1);

namespace App\ApiController\Checkin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Repository\EmployeeRepository;
use App\Repository\WorkspaceRepository;
use App\Service\CheckinService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class CheckinController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/checkin/{workspaceQrToken}', name: 'checkin_status', methods: ['GET'])]
    public function status(
        string $workspaceQrToken,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        CheckinService $checkinService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByQrToken($workspaceQrToken);
        if ($workspace === null) {
            throw new NotFoundHttpException('Invalid check-in link');
        }

        $employee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        if ($employee === null || !$employee->isActive()) {
            throw new AccessDeniedHttpException('You are not registered as an employee in this workspace');
        }

        $attendance = $checkinService->getStatus($employee);
        $shift = $employee->getShift();

        return $this->jsonSuccess([
            'employeeName' => $employee->getName(),
            'shiftName' => $shift?->getName(),
            'shiftStart' => $shift?->getStartTime()?->format('H:i'),
            'shiftEnd' => $shift?->getEndTime()?->format('H:i'),
            'linkedUserPublicId' => $employee->getLinkedUser()?->getPublicId(),
            'today' => [
                'checkedIn' => $attendance?->getCheckInAt() !== null,
                'checkedOut' => $attendance?->getCheckOutAt() !== null,
                'checkInAt' => $attendance?->getCheckInAt()?->format('H:i'),
                'checkOutAt' => $attendance?->getCheckOutAt()?->format('H:i'),
                'isLate' => $attendance?->isLate() ?? false,
            ],
        ]);
    }

    #[Route('/checkin/{workspaceQrToken}', name: 'checkin_action', methods: ['POST'])]
    public function checkin(
        string $workspaceQrToken,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        CheckinService $checkinService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByQrToken($workspaceQrToken);
        if ($workspace === null) {
            throw new NotFoundHttpException('Invalid check-in link');
        }

        $employee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        if ($employee === null || !$employee->isActive()) {
            throw new AccessDeniedHttpException('You are not registered as an employee in this workspace');
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $latitude = isset($data['latitude']) ? (float) $data['latitude'] : null;
        $longitude = isset($data['longitude']) ? (float) $data['longitude'] : null;
        $deviceId = isset($data['deviceId']) ? (string) $data['deviceId'] : null;
        $deviceName = isset($data['deviceName']) ? (string) $data['deviceName'] : null;

        $attendance = $checkinService->checkin(
            $employee,
            $request->getClientIp() ?? '',
            $latitude,
            $longitude,
            $deviceId,
            $deviceName,
        );

        return $this->jsonSuccess([
            'checkInAt' => $attendance->getCheckInAt()?->format('H:i'),
            'checkOutAt' => $attendance->getCheckOutAt()?->format('H:i'),
            'isLate' => $attendance->isLate(),
            'leftEarly' => $attendance->hasLeftEarly(),
        ]);
    }
}

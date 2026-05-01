<?php

declare(strict_types=1);

namespace App\ApiController\Checkin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceQrCode;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Repository\WorkspaceQrCodeRepository;
use App\Repository\WorkspaceRepository;
use App\Service\Checkin\EffectiveCheckinSettings;
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
        LeaveRequestRepository $leaveRequestRepository,
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

        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $todayDate = \App\Service\DateService::today($tz);
        $approvedLeave = $leaveRequestRepository->findApprovedForEmployeeOnDate($employee, $todayDate);

        return $this->jsonSuccess([
            'employeeName' => $employee->getName(),
            'shiftName' => $shift?->getName(),
            'shiftStart' => $shift?->getStartTime()?->format('H:i'),
            'shiftEnd' => $shift?->getEndTime()?->format('H:i'),
            'onLeave' => $approvedLeave !== null,
            'leaveIsFullDay' => $approvedLeave?->isFullDay() ?? false,
            'today' => [
                'checkedIn' => $attendance?->getCheckInAt() !== null,
                'checkedOut' => $attendance?->getCheckOutAt() !== null,
                'checkInAt' => $attendance?->getCheckInAt() ? (clone $attendance->getCheckInAt())->setTimezone($tz)->format('H:i') : null,
                'checkOutAt' => $attendance?->getCheckOutAt() ? (clone $attendance->getCheckOutAt())->setTimezone($tz)->format('H:i') : null,
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

        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

        return $this->jsonSuccess([
            'checkInAt' => $attendance->getCheckInAt() ? (clone $attendance->getCheckInAt())->setTimezone($tz)->format('H:i') : null,
            'checkOutAt' => $attendance->getCheckOutAt() ? (clone $attendance->getCheckOutAt())->setTimezone($tz)->format('H:i') : null,
            'isLate' => $attendance->isLate(),
            'leftEarly' => $attendance->hasLeftEarly(),
        ]);
    }

    #[Route('/checkin/qr/{qrToken}', name: 'checkin_qr_status', methods: ['GET'])]
    public function qrStatus(
        string $qrToken,
        #[CurrentUser] User $user,
        WorkspaceQrCodeRepository $qrCodeRepository,
        EmployeeRepository $employeeRepository,
        CheckinService $checkinService,
        LeaveRequestRepository $leaveRequestRepository,
    ): JsonResponse {
        [$qrCode, $workspace, $employee] = $this->resolveQrContext($qrToken, $user, $qrCodeRepository, $employeeRepository);

        $attendance = $checkinService->getStatus($employee);
        $shift = $employee->getShift();

        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $todayDate = \App\Service\DateService::today($tz);
        $approvedLeave = $leaveRequestRepository->findApprovedForEmployeeOnDate($employee, $todayDate);

        return $this->jsonSuccess([
            'qrCodeName' => $qrCode->getName(),
            'employeeName' => $employee->getName(),
            'shiftName' => $shift?->getName(),
            'shiftStart' => $shift?->getStartTime()?->format('H:i'),
            'shiftEnd' => $shift?->getEndTime()?->format('H:i'),
            'onLeave' => $approvedLeave !== null,
            'leaveIsFullDay' => $approvedLeave?->isFullDay() ?? false,
            'today' => [
                'checkedIn' => $attendance?->getCheckInAt() !== null,
                'checkedOut' => $attendance?->getCheckOutAt() !== null,
                'checkInAt' => $attendance?->getCheckInAt() ? (clone $attendance->getCheckInAt())->setTimezone($tz)->format('H:i') : null,
                'checkOutAt' => $attendance?->getCheckOutAt() ? (clone $attendance->getCheckOutAt())->setTimezone($tz)->format('H:i') : null,
                'isLate' => $attendance?->isLate() ?? false,
            ],
        ]);
    }

    #[Route('/checkin/qr/{qrToken}', name: 'checkin_qr_action', methods: ['POST'])]
    public function qrCheckin(
        string $qrToken,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceQrCodeRepository $qrCodeRepository,
        EmployeeRepository $employeeRepository,
        CheckinService $checkinService,
    ): JsonResponse {
        [$qrCode, $workspace, $employee] = $this->resolveQrContext($qrToken, $user, $qrCodeRepository, $employeeRepository);

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
            EffectiveCheckinSettings::fromQrCode($qrCode),
            $qrCode,
        );

        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

        return $this->jsonSuccess([
            'checkInAt' => $attendance->getCheckInAt() ? (clone $attendance->getCheckInAt())->setTimezone($tz)->format('H:i') : null,
            'checkOutAt' => $attendance->getCheckOutAt() ? (clone $attendance->getCheckOutAt())->setTimezone($tz)->format('H:i') : null,
            'isLate' => $attendance->isLate(),
            'leftEarly' => $attendance->hasLeftEarly(),
        ]);
    }

    /**
     * @return array{0: WorkspaceQrCode, 1: Workspace, 2: \App\Entity\Employee}
     */
    private function resolveQrContext(
        string $qrToken,
        User $user,
        WorkspaceQrCodeRepository $qrCodeRepository,
        EmployeeRepository $employeeRepository,
    ): array {
        $qrCode = $qrCodeRepository->findByQrToken($qrToken);
        if ($qrCode === null) {
            throw new NotFoundHttpException('Invalid check-in link');
        }

        $workspace = $qrCode->getWorkspace();
        if ($workspace === null) {
            throw new NotFoundHttpException('Invalid check-in link');
        }

        $employee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        if ($employee === null || !$employee->isActive()) {
            throw new AccessDeniedHttpException('You are not registered as an employee in this workspace');
        }

        if (!$qrCode->hasAssignedEmployee($employee)) {
            throw new AccessDeniedHttpException('You are not assigned to this QR code');
        }

        return [$qrCode, $workspace, $employee];
    }
}

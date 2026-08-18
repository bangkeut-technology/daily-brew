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
use App\Enum\FeatureFlagEnum;
use App\Service\Checkin\EffectiveCheckinSettings;
use App\Service\CheckinService;
use App\Service\FeatureFlagService;
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
        FeatureFlagService $featureFlagService,
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
            'workspaceTapCheckinEnabled' => $workspace->getSetting()?->isTapCheckinEnabled() ?? false,
            'workspaceNfcCheckinEnabled' => ($workspace->getSetting()?->isNfcCheckinEnabled() ?? false)
                && $featureFlagService->isEnabledForWorkspace(FeatureFlagEnum::NfcCheckin, $workspace),
            'today' => [
                // The row an overnight worker is standing in at 01:00 is
                // yesterday's — the key stays `today` for the mobile clients,
                // but `date` says which day the punch actually belongs to.
                'date' => $attendance?->getDate()?->format('Y-m-d'),
                'checkedIn' => $attendance?->getCheckInAt() !== null,
                'checkedOut' => $attendance?->getCheckOutAt() !== null,
                'checkInAt' => $attendance?->getCheckInAt() ? (clone $attendance->getCheckInAt())->setTimezone($tz)->format('H:i') : null,
                'checkOutAt' => $attendance?->getCheckOutAt() ? (clone $attendance->getCheckOutAt())->setTimezone($tz)->format('H:i') : null,
                'checkOutNextDay' => $attendance !== null && $this->isCheckOutNextDay($attendance, $tz),
                // Absolute instants alongside the wall-clock strings. A client
                // can render "18:00" from the latter, but it cannot rebuild the
                // moment from it — that needs the workspace's zone *and* the
                // right calendar day, which is exactly what an overnight shift
                // makes ambiguous. Anything measuring elapsed time (the shift
                // widgets, the Live Activity timer) reads these.
                'checkInAtIso' => $attendance?->getCheckInAt()?->format(\DateTimeInterface::ATOM),
                'checkOutAtIso' => $attendance?->getCheckOutAt()?->format(\DateTimeInterface::ATOM),
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
        FeatureFlagService $featureFlagService,
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
        $this->assertOriginAllowed($data, $workspace, $featureFlagService);
        $latitude = isset($data['latitude']) ? (float) $data['latitude'] : null;
        $longitude = isset($data['longitude']) ? (float) $data['longitude'] : null;
        $deviceId = isset($data['deviceId']) ? (string) $data['deviceId'] : null;
        $deviceName = isset($data['deviceName']) ? (string) $data['deviceName'] : null;
        $source = ($data['origin'] ?? null) === 'nfc' ? CheckinService::SOURCE_NFC : null;

        $settings = EffectiveCheckinSettings::fromWorkspace($workspace);

        $attendance = $checkinService->checkin(
            $employee,
            $request->getClientIp() ?? '',
            $latitude,
            $longitude,
            $deviceId,
            $deviceName,
            $settings,
            null,
            $source,
        );

        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

        return $this->jsonSuccess([
            'checkInAt' => $attendance->getCheckInAt() ? (clone $attendance->getCheckInAt())->setTimezone($tz)->format('H:i') : null,
            'checkOutAt' => $attendance->getCheckOutAt() ? (clone $attendance->getCheckOutAt())->setTimezone($tz)->format('H:i') : null,
            // Overnight shift: the check-out clock time belongs to the day after
            // the row, so a client showing "18:00 → 02:00" can say which day.
            'checkOutNextDay' => $this->isCheckOutNextDay($attendance, $tz),
            'date' => $attendance->getDate()?->format('Y-m-d'),
            'checkInAtIso' => $attendance->getCheckInAt()?->format(\DateTimeInterface::ATOM),
            'checkOutAtIso' => $attendance->getCheckOutAt()?->format(\DateTimeInterface::ATOM),
            'isLate' => $attendance->isLate(),
            'leftEarly' => $attendance->hasLeftEarly(),
            'verification' => $this->verificationPayload($settings),
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
                // The row an overnight worker is standing in at 01:00 is
                // yesterday's — the key stays `today` for the mobile clients,
                // but `date` says which day the punch actually belongs to.
                'date' => $attendance?->getDate()?->format('Y-m-d'),
                'checkedIn' => $attendance?->getCheckInAt() !== null,
                'checkedOut' => $attendance?->getCheckOutAt() !== null,
                'checkInAt' => $attendance?->getCheckInAt() ? (clone $attendance->getCheckInAt())->setTimezone($tz)->format('H:i') : null,
                'checkOutAt' => $attendance?->getCheckOutAt() ? (clone $attendance->getCheckOutAt())->setTimezone($tz)->format('H:i') : null,
                'checkOutNextDay' => $attendance !== null && $this->isCheckOutNextDay($attendance, $tz),
                // Absolute instants alongside the wall-clock strings. A client
                // can render "18:00" from the latter, but it cannot rebuild the
                // moment from it — that needs the workspace's zone *and* the
                // right calendar day, which is exactly what an overnight shift
                // makes ambiguous. Anything measuring elapsed time (the shift
                // widgets, the Live Activity timer) reads these.
                'checkInAtIso' => $attendance?->getCheckInAt()?->format(\DateTimeInterface::ATOM),
                'checkOutAtIso' => $attendance?->getCheckOutAt()?->format(\DateTimeInterface::ATOM),
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
        FeatureFlagService $featureFlagService,
    ): JsonResponse {
        [$qrCode, $workspace, $employee] = $this->resolveQrContext($qrToken, $user, $qrCodeRepository, $employeeRepository);

        $data = json_decode($request->getContent(), true) ?? [];
        $this->assertOriginAllowed($data, $workspace, $featureFlagService);
        $latitude = isset($data['latitude']) ? (float) $data['latitude'] : null;
        $longitude = isset($data['longitude']) ? (float) $data['longitude'] : null;
        $deviceId = isset($data['deviceId']) ? (string) $data['deviceId'] : null;
        $deviceName = isset($data['deviceName']) ? (string) $data['deviceName'] : null;
        $source = ($data['origin'] ?? null) === 'nfc' ? CheckinService::SOURCE_NFC : null;

        $settings = EffectiveCheckinSettings::fromQrCode($qrCode);

        $attendance = $checkinService->checkin(
            $employee,
            $request->getClientIp() ?? '',
            $latitude,
            $longitude,
            $deviceId,
            $deviceName,
            $settings,
            $qrCode,
            $source,
        );

        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

        return $this->jsonSuccess([
            'checkInAt' => $attendance->getCheckInAt() ? (clone $attendance->getCheckInAt())->setTimezone($tz)->format('H:i') : null,
            'checkOutAt' => $attendance->getCheckOutAt() ? (clone $attendance->getCheckOutAt())->setTimezone($tz)->format('H:i') : null,
            // Overnight shift: the check-out clock time belongs to the day after
            // the row, so a client showing "18:00 → 02:00" can say which day.
            'checkOutNextDay' => $this->isCheckOutNextDay($attendance, $tz),
            'date' => $attendance->getDate()?->format('Y-m-d'),
            'checkInAtIso' => $attendance->getCheckInAt()?->format(\DateTimeInterface::ATOM),
            'checkOutAtIso' => $attendance->getCheckOutAt()?->format(\DateTimeInterface::ATOM),
            'isLate' => $attendance->isLate(),
            'leftEarly' => $attendance->hasLeftEarly(),
            'verification' => $this->verificationPayload($settings),
        ]);
    }

    /**
     * Which check-in protections were enforced for this scan. Because the
     * check-in succeeded, every enabled protection was satisfied — so the
     * mobile client can show the employee a "verified at restaurant / on this
     * device / on the restaurant network" confirmation. Surfaces only the
     * outcome; never raw coordinates, IP, or device id.
     *
     * @return array{location: bool, device: bool, network: bool}
     */
    /**
     * Did this check-out land on the calendar day after the attendance's own
     * date? True only for a shift that runs past midnight — the row stays filed
     * under the day the shift started, so the clock time alone reads backwards.
     */
    private function isCheckOutNextDay(\App\Entity\Attendance $attendance, \DateTimeZone $tz): bool
    {
        $checkOut = $attendance->getCheckOutAt();
        $date = $attendance->getDate();
        if ($checkOut === null || $date === null) {
            return false;
        }

        return \DateTimeImmutable::createFromInterface($checkOut)->setTimezone($tz)->format('Y-m-d')
            > $date->format('Y-m-d');
    }

    private function verificationPayload(EffectiveCheckinSettings $settings): array
    {
        return [
            'location' => $settings->geofencingEnabled,
            'device' => $settings->deviceVerificationEnabled,
            'network' => $settings->ipRestrictionEnabled,
        ];
    }

    /**
     * Block NFC-originated check-ins when the workspace has NFC check-in turned
     * off (or the feature isn't available to it). The mobile deep-link / NFC
     * flow tags its request `origin: "nfc"`; QR scans and the tap button send
     * no origin, so they are unaffected. A raw URL with no origin bypasses this
     * — it gates the sanctioned NFC path, not a hard security control.
     */
    private function assertOriginAllowed(
        array $data,
        Workspace $workspace,
        FeatureFlagService $featureFlagService,
    ): void {
        $origin = is_string($data['origin'] ?? null) ? $data['origin'] : null;
        if ($origin !== 'nfc') {
            return;
        }

        $nfcEnabled = ($workspace->getSetting()?->isNfcCheckinEnabled() ?? false)
            && $featureFlagService->isEnabledForWorkspace(FeatureFlagEnum::NfcCheckin, $workspace);
        if (!$nfcEnabled) {
            throw new AccessDeniedHttpException('NFC check-in is disabled for this workspace');
        }
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

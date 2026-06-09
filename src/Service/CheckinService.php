<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\WorkspaceQrCode;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\Checkin\EffectiveCheckinSettings;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CheckinService
{
    /** Source tag for an NFC tag tap. Distinguishes a tap from a QR scan / button press. */
    public const SOURCE_NFC = 'nfc';

    public function __construct(
        private AttendanceRepository $attendanceRepository,
        private ClosurePeriodRepository $closurePeriodRepository,
        private LeaveRequestRepository $leaveRequestRepository,
        private AttendanceFlagCalculator $flagCalculator,
        private ?AttendanceAnomalyDetector $anomalyDetector = null,
        private ?NotificationService $notificationService = null,
    ) {}

    public function checkin(
        Employee $employee,
        string $clientIp,
        ?float $latitude = null,
        ?float $longitude = null,
        ?string $deviceId = null,
        ?string $deviceName = null,
        ?EffectiveCheckinSettings $settings = null,
        ?WorkspaceQrCode $qrCode = null,
        ?string $source = null,
    ): Attendance {
        $workspace = $employee->getWorkspace();
        $settings ??= $workspace !== null
            ? EffectiveCheckinSettings::fromWorkspace($workspace)
            : new EffectiveCheckinSettings('UTC', false, null, false, null, null, null, false);

        $wsTz = new \DateTimeZone($settings->timezone);
        $nowUtc = DateService::now();
        $today = DateService::today($wsTz);

        // NFC double-tap guard: a single tap on an NTAG sticker can fire two
        // browser navigations in rapid succession (the phone wakes the screen,
        // the user reflexively taps again "in case it didn't work"). Without
        // this, the second tap would flip a fresh check-in into a check-out.
        // Idempotent: return the existing row unchanged — no new write, no
        // exception, no flag recompute — so the mobile UI keeps showing the
        // confirmation it already has. QR scans deliberately bypass this gate;
        // the cooldown is for the eyes-off NFC flow only.
        if ($source === self::SOURCE_NFC) {
            $cooldownMinutes = $workspace?->getSetting()?->getNfcCheckinIntervalMinutes() ?? 0;
            if ($cooldownMinutes > 0) {
                $existing = $this->attendanceRepository->findByEmployeeAndDate($employee, $today);
                if ($existing !== null && !$existing->isVoided() && $existing->getCheckInAt() !== null) {
                    $lastPunchAt = $existing->getCheckOutAt() ?? $existing->getCheckInAt();
                    $diffSeconds = $nowUtc->getTimestamp() - $lastPunchAt->getTimestamp();
                    if ($diffSeconds >= 0 && $diffSeconds < $cooldownMinutes * 60) {
                        return $existing;
                    }
                }
            }
        }

        // IP restriction check
        if ($settings->ipRestrictionEnabled) {
            $allowedIps = $settings->allowedIps;
            if (!empty($allowedIps) && !in_array($clientIp, $allowedIps, true)) {
                throw new AccessDeniedHttpException('Check-in not allowed from this location');
            }
        }

        // Geofencing check
        if ($settings->geofencingEnabled) {
            if ($latitude === null || $longitude === null) {
                throw new AccessDeniedHttpException('Location is required for check-in at this workspace');
            }
            $fenceLat = $settings->geofencingLatitude;
            $fenceLng = $settings->geofencingLongitude;
            $fenceRadius = max($settings->geofencingRadiusMeters ?? 100, 50);

            if ($fenceLat !== null && $fenceLng !== null) {
                $distance = $this->haversineDistance($fenceLat, $fenceLng, $latitude, $longitude);
                if ($distance > $fenceRadius) {
                    throw new AccessDeniedHttpException(sprintf(
                        'Check-in not allowed from this location — you are %dm away (allowed: %dm)',
                        (int) round($distance),
                        $fenceRadius,
                    ));
                }
            }
        }

        // Closure check
        $closure = $this->closurePeriodRepository->findActiveOnDate($workspace, $today);
        if ($closure !== null) {
            throw new BadRequestHttpException('Restaurant is closed today (' . $closure->getName() . ')');
        }

        // Approved full-day leave check
        $approvedLeave = $this->leaveRequestRepository->findApprovedForEmployeeOnDate($employee, $today);
        if ($approvedLeave !== null && $approvedLeave->isFullDay()) {
            throw new BadRequestHttpException('You are on approved leave today');
        }

        // Find or create attendance
        $attendance = $this->attendanceRepository->findByEmployeeAndDate($employee, $today);
        // A voided row is a tombstone holding the (employee, date) slot — treat
        // it as if no row existed for check-in purposes. Resurrect by wiping
        // void + scan state, then run the fresh check-in path.
        $resurrecting = $attendance !== null && $attendance->isVoided();
        $action = null;

        if ($attendance === null || $resurrecting) {
            // Device double check-in prevention (Espresso feature)
            if ($settings->deviceVerificationEnabled && $deviceId !== null) {
                $existing = $this->attendanceRepository->findByDeviceIdAndDateExcludingEmployee(
                    $workspace,
                    $deviceId,
                    $today,
                    $employee,
                );
                if ($existing !== null) {
                    throw new AccessDeniedHttpException('This device has already been used to check in another employee today');
                }
            }

            if ($attendance === null) {
                $attendance = new Attendance();
                $attendance->setEmployee($employee);
                $attendance->setWorkspace($workspace);
            } else {
                // Wipe the resurrected row so it starts a clean check-in cycle.
                $attendance->clearVoid()
                    ->setCheckOutAt(null)
                    ->setCheckOutLat(null)->setCheckOutLng(null)
                    ->setCheckOutDeviceId(null)->setCheckOutDeviceName(null)
                    ->setOriginalCheckInAt(null)->setOriginalCheckOutAt(null)
                    ->setEditedAt(null)->setEditedBy(null)->setEditedByEmail(null)->setEditReason(null);
            }
            $attendance->setQrCode($qrCode);
            $attendance->setDate($today);
            $attendance->setCheckInAt($nowUtc);
            $attendance->setCheckInLat($latitude);
            $attendance->setCheckInLng($longitude);
            $attendance->setIpAddress($clientIp);
            $attendance->setCheckInDeviceId($deviceId);
            $attendance->setCheckInDeviceName($deviceName);

            $this->flagCalculator->recompute($attendance, $employee, $wsTz);

            if (!$resurrecting) {
                $this->attendanceRepository->persist($attendance);
            }
            $action = 'in';
        } elseif ($attendance->getCheckOutAt() === null) {
            // Device verification check (Espresso feature)
            if (
                $settings->deviceVerificationEnabled
                && $attendance->getCheckInDeviceId() !== null
                && $deviceId !== null
                && $deviceId !== $attendance->getCheckInDeviceId()
            ) {
                throw new AccessDeniedHttpException('Check-out must be from the same device used for check-in');
            }

            // Check out
            $attendance->setCheckOutAt($nowUtc);
            $attendance->setCheckOutLat($latitude);
            $attendance->setCheckOutLng($longitude);
            $attendance->setIpAddress($clientIp);
            $attendance->setCheckOutDeviceId($deviceId);
            $attendance->setCheckOutDeviceName($deviceName);

            $this->flagCalculator->recompute($attendance, $employee, $wsTz);
            $action = 'out';
        } else {
            throw new BadRequestHttpException('Already checked in and out for today');
        }

        $this->attendanceRepository->flush();

        // Alert the workspace if this punch came from a device the employee
        // hasn't used before. Never let a notification failure break check-in.
        if ($action !== null && $deviceId !== null && $this->anomalyDetector !== null) {
            try {
                $this->anomalyDetector->handle($attendance, $action, $deviceId);
            } catch (\Throwable) {
                // best-effort side effect
            }
        }

        // Live Telegram ping to the owner if they've opted in (Espresso+,
        // off by default). Internal gate on the workspace setting flag, so
        // the call here doesn't need a plan check. Wrap in try/catch for
        // the same reason as the anomaly detector — best-effort side effect.
        if ($action !== null && $this->notificationService !== null) {
            try {
                $this->notificationService->notifyEmployeeCheckin($attendance, $action);
            } catch (\Throwable) {
                // best-effort side effect
            }
        }

        return $attendance;
    }

    public function getStatus(Employee $employee): ?Attendance
    {
        $tz = new \DateTimeZone($employee->getWorkspace()?->getSetting()?->getTimezone() ?? 'UTC');
        $attendance = $this->attendanceRepository->findByEmployeeAndDate(
            $employee,
            DateService::today($tz)
        );
        // A voided row is a tombstone — for the employee's "today" status it
        // didn't happen, so they read as not-checked-in until they scan again
        // (which resurrects the row via checkin()'s tombstone path).
        return $attendance?->isVoided() ? null : $attendance;
    }

    /**
     * Haversine distance between two coordinates in meters.
     */
    private function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6_371_000; // meters
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}

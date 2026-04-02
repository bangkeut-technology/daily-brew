<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Enum\DayOfWeekEnum;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CheckinService
{
    public function __construct(
        private EntityManagerInterface $em,
        private AttendanceRepository $attendanceRepository,
        private ClosurePeriodRepository $closurePeriodRepository,
        private LeaveRequestRepository $leaveRequestRepository,
        private PlanService $planService,
    ) {}

    public function checkin(
        Employee $employee,
        string $clientIp,
        ?float $latitude = null,
        ?float $longitude = null,
        ?string $deviceId = null,
        ?string $deviceName = null,
    ): Attendance {
        $workspace = $employee->getWorkspace();
        $setting = $workspace?->getSetting();
        $wsTz = new \DateTimeZone($setting?->getTimezone() ?? 'UTC');
        $nowUtc = DateService::now();
        $now = $nowUtc->setTimezone($wsTz); // for time comparisons (late/early)
        $today = DateService::today($wsTz);

        // IP restriction check
        if ($setting !== null && $setting->isIpRestrictionEnabled()) {
            $allowedIps = $setting->getAllowedIps();
            if (!empty($allowedIps) && !in_array($clientIp, $allowedIps, true)) {
                throw new AccessDeniedHttpException('Check-in not allowed from this location');
            }
        }

        // Geofencing check
        if ($setting !== null && $setting->isGeofencingEnabled()) {
            if ($latitude === null || $longitude === null) {
                throw new AccessDeniedHttpException('Location is required for check-in at this workspace');
            }
            $fenceLat = $setting->getGeofencingLatitude();
            $fenceLng = $setting->getGeofencingLongitude();
            $fenceRadius = max($setting->getGeofencingRadiusMeters() ?? 100, 50);

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

        if ($attendance === null) {
            // Device double check-in prevention (Espresso feature)
            if (
                $setting !== null
                && $setting->isDeviceVerificationEnabled()
                && $deviceId !== null
            ) {
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

            // Check in
            $attendance = new Attendance();
            $attendance->setEmployee($employee);
            $attendance->setWorkspace($workspace);
            $attendance->setDate($today);
            $attendance->setCheckInAt($nowUtc);
            $attendance->setCheckInLat($latitude);
            $attendance->setCheckInLng($longitude);
            $attendance->setIpAddress($clientIp);
            $attendance->setCheckInDeviceId($deviceId);
            $attendance->setCheckInDeviceName($deviceName);

            // Late detection (ShiftTimeRule-aware)
            // Shift times are stored as bare H:i values representing workspace-local time,
            // so we compare them against $now which is already in the workspace timezone.
            $shift = $employee->getShift();
            if ($shift !== null) {
                $shiftStart = $this->resolveEffectiveStartTime($shift, $now);
                if ($shiftStart !== null) {
                    $grace = $shift->getGraceLateMinutes();
                    $startMinutes = $this->timeToMinutes($shiftStart);
                    $startMinutes += $grace;
                    $checkInMinutes = (int) $now->format('G') * 60 + (int) $now->format('i');
                    $attendance->setIsLate($checkInMinutes > $startMinutes);
                }
            }

            $this->em->persist($attendance);
        } elseif ($attendance->getCheckOutAt() === null) {
            // Device verification check (Espresso feature)
            if (
                $setting !== null
                && $setting->isDeviceVerificationEnabled()
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

            // Left early detection (ShiftTimeRule-aware)
            $shift = $employee->getShift();
            if ($shift !== null) {
                $shiftEnd = $this->resolveEffectiveEndTime($shift, $now);
                if ($shiftEnd !== null) {
                    $grace = $shift->getGraceEarlyMinutes();
                    $endMinutes = $this->timeToMinutes($shiftEnd);
                    $endMinutes -= $grace;
                    $checkOutMinutes = (int) $now->format('G') * 60 + (int) $now->format('i');
                    $attendance->setLeftEarly($checkOutMinutes < $endMinutes);
                }
            }
        } else {
            throw new BadRequestHttpException('Already checked in and out for today');
        }

        $this->em->flush();

        return $attendance;
    }

    public function getStatus(Employee $employee): ?Attendance
    {
        $tz = new \DateTimeZone($employee->getWorkspace()?->getSetting()?->getTimezone() ?? 'UTC');
        return $this->attendanceRepository->findByEmployeeAndDate(
            $employee,
            DateService::today($tz)
        );
    }

    /**
     * Resolve effective start time for a shift on a given date.
     * Checks ShiftTimeRule per-day override first (Espresso+ only), falls back to default.
     */
    private function resolveEffectiveStartTime(\App\Entity\Shift $shift, \DateTimeInterface $date): ?\DateTimeInterface
    {
        $workspace = $shift->getWorkspace();
        if ($workspace !== null && $this->planService->canUseShiftTimeRules($workspace)) {
            $dayOfWeek = DayOfWeekEnum::tryFrom((int) $date->format('N'));
            if ($dayOfWeek !== null) {
                foreach ($shift->getTimeRules() as $rule) {
                    if ($rule->getDayOfWeek() === $dayOfWeek) {
                        return DateService::createFromFormat('H:i', $rule->getStartTime()) ?: null;
                    }
                }
            }
        }
        return $shift->getStartTime();
    }

    private function resolveEffectiveEndTime(\App\Entity\Shift $shift, \DateTimeInterface $date): ?\DateTimeInterface
    {
        $workspace = $shift->getWorkspace();
        if ($workspace !== null && $this->planService->canUseShiftTimeRules($workspace)) {
            $dayOfWeek = DayOfWeekEnum::tryFrom((int) $date->format('N'));
            if ($dayOfWeek !== null) {
                foreach ($shift->getTimeRules() as $rule) {
                    if ($rule->getDayOfWeek() === $dayOfWeek) {
                        return DateService::createFromFormat('H:i', $rule->getEndTime()) ?: null;
                    }
                }
            }
        }
        return $shift->getEndTime();
    }

    /**
     * Extract minutes-since-midnight from a time value.
     *
     * Shift times are conceptually "wall-clock" values (e.g. 08:00 means 8 AM
     * in the workspace timezone) regardless of the DateTimeZone attached to the
     * object.  Doctrine's `time` type hydrates with the server default TZ and
     * DateService::createFromFormat uses UTC, but either way the H:i digits
     * represent the intended local time.  We therefore read just the hour and
     * minute digits — never converting to another timezone.
     */
    private function timeToMinutes(\DateTimeInterface $time): int
    {
        // format('G') gives 0-23 hour without leading zero; 'i' gives 00-59 minutes.
        // These reflect the digits stored in the DB, not a TZ-converted wall-clock.
        return (int) $time->format('G') * 60 + (int) $time->format('i');
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

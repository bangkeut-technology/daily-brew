<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Attendance;
use App\Repository\AttendanceRepository;

/**
 * Detects when an attendance punch comes from a device the employee hasn't
 * used before and alerts the workspace (Telegram + push) via NotificationService.
 *
 * "New" means: the employee already has at least one known device on record, and
 * this device isn't one of them. An employee's very first device is the baseline,
 * not an anomaly. Gated to Espresso+ and runs after the Attendance is persisted.
 */
class AttendanceAnomalyDetector
{
    public function __construct(
        private readonly AttendanceRepository $attendanceRepository,
        private readonly PlanService $planService,
        private readonly NotificationService $notificationService,
    ) {
    }

    /**
     * @param string $action 'in' for a check-in, 'out' for a check-out
     */
    public function handle(Attendance $attendance, string $action, ?string $deviceId): void
    {
        if ($deviceId === null || $deviceId === '') {
            return;
        }

        $employee = $attendance->getEmployee();
        $workspace = $attendance->getWorkspace();
        if ($employee === null || $workspace === null) {
            return;
        }

        if (!$this->planService->canUseAnomalyDetection($workspace)) {
            return;
        }

        $known = $this->attendanceRepository->findKnownDeviceIds($employee, $attendance->getId());

        // A check-out from the same device used for today's check-in is never an
        // anomaly (and a device already flagged at check-in shouldn't fire twice).
        if ($action === 'out') {
            $checkInDeviceId = $attendance->getCheckInDeviceId();
            if ($checkInDeviceId !== null && $checkInDeviceId !== '') {
                $known[] = $checkInDeviceId;
            }
        }

        $known = array_values(array_unique(array_filter($known)));

        // No prior device on record → this is the employee's baseline device.
        if (count($known) === 0) {
            return;
        }

        if (in_array($deviceId, $known, true)) {
            return;
        }

        $this->notificationService->notifyDeviceAnomaly($attendance, $action);
    }
}

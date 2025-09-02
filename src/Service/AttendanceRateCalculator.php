<?php
declare(strict_types=1);

namespace App\Service;

use App\Entity\Employee;
use App\Repository\AttendanceRepository;
use App\Service\SettingService;
use DatePeriod;

class AttendanceRateCalculator
{
    public function __construct(
        private readonly AttendanceRepository $attendanceRepository,
        private readonly SettingService $settingService,
    ) {}

    public function getAdjustedAbsences(Employee $employee, DatePeriod $period): int
    {
        $lates = $this->attendanceRepository->countLate($employee, $period);
        $absences = $this->attendanceRepository->countAbsent($employee, $period);

        $maxLateAllowed = (int) $this->settingService->get('maximum_late_count') ?? 3;
        $penaltyAbsences = intdiv($lates, $maxLateAllowed);

        return $absences + $penaltyAbsences;
    }

    public function calculateRate(Employee $employee, DatePeriod $period): float
    {
        $totalDays = iterator_count($period);
        if ($totalDays === 0) {
            return 0.0;
        }

        $adjustedAbsences = $this->getAdjustedAbsences($employee, $period);

        return round((($totalDays - $adjustedAbsences) / $totalDays) * 100, 2);
    }

    public function summarize(Employee $employee, DatePeriod $period): array
    {
        $lates = $this->attendanceRepository->countLate($employee, $period);
        $absences = $this->attendanceRepository->countAbsent($employee, $period);
        $maxLateAllowed = (int) $this->settingService->get('maximum_late_count') ?? 3;
        $penaltyAbsences = intdiv($lates, $maxLateAllowed);

        $adjustedAbsences = $absences + $penaltyAbsences;
        $totalDays = iterator_count($period);
        $rate = $totalDays === 0 ? 0.0 : round((($totalDays - $adjustedAbsences) / $totalDays) * 100, 2);

        return [
            'attendance_rate' => $rate,
            'total_days' => $totalDays,
            'absences' => $absences,
            'lates' => $lates,
            'penalty_absences' => $penaltyAbsences,
            'adjusted_absences' => $adjustedAbsences,
        ];
    }
}

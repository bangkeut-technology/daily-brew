<?php
declare(strict_types=1);

namespace App\Service;

use App\Constant\SettingConstant;
use App\Entity\Employee;
use App\Repository\AttendanceRepository;
use App\Util\DateHelper;
use DateTimeImmutable;

/**
 * Class AttendanceRateCalculator
 *
 * @package App\Service
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class AttendanceRateCalculator
{
    public function __construct(
        private AttendanceRepository $attendanceRepository,
        private SettingService       $settingService,
    )
    {
    }

    /**
     * Calculates the adjusted number of absences for an employee over a given period.
     *
     * This method retrieves the count of late arrivals and absences for a specified
     * employee within a defined date range. It computes the penalty absences based
     * on the number of lates divided by the maximum allowable late count and returns
     * the total absences including penalties.
     *
     * @param Employee          $employee The employee whose absences are being calculated.
     * @param DateTimeImmutable $start
     * @param DateTimeImmutable $end
     * @return int The total adjusted absences including penalty absences.
     */
    public function getAdjustedAbsences(Employee $employee, DateTimeImmutable $start, DateTimeImmutable $end): int
    {
        $lates = $this->attendanceRepository->countLate($employee, $start, $end);
        $absences = $this->attendanceRepository->countAbsent($employee, $start, $end);

        if (0 === $maxLateAllowed = $this->settingService->getInt(SettingConstant::MAXIMUM_LATE_COUNT, 3)) {
            return $absences;
        }

        $penaltyAbsences = intdiv($lates, $maxLateAllowed);

        return $absences + $penaltyAbsences;
    }

    /**
     * Calculates the attendance rate for an employee over a specified period.
     *
     * This method computes the attendance rate by determining the total number
     * of days in the given period and subtracting the adjusted absences
     * (computed using getAdjustedAbsences). The rate is expressed as a percentage
     * and rounded to two decimal places. If the total number of days is zero,
     * it returns 0.0.
     *
     * @param Employee   $employee The employee for whom the attendance rate is calculated.
     * @param DateTimeImmutable $start The start date of the period.
     * @param DateTimeImmutable $end The end date of the period.
     *
     * @return float The attendance rate as a percentage, rounded to two decimal places.
     */
    public function calculateRate(Employee $employee, DateTimeImmutable $start, DateTimeImmutable $end): float
    {
        if (0 === $totalDays = DateHelper::daysBetween($start, $end, true)) {
            return 0.0;
        }

        $adjustedAbsences = $this->getAdjustedAbsences($employee, $start, $end);

        return round((($totalDays - $adjustedAbsences) / $totalDays) * 100, 2);
    }

    /**
     * Summarizes the attendance statistics for an employee within a specified period.
     *
     * This method calculates key attendance metrics, including the number of late arrivals,
     * absences, penalty absences due to excessive lates, adjusted absences, total days in
     * the period, and the overall attendance rate. It returns an array containing these stats.
     *
     * @param Employee          $employee The employee whose attendance is being summarized.
     * @param DateTimeImmutable $start    The start date of the period.
     * @param DateTimeImmutable $end      The end date of the period.
     * @return array An associative array containing attendance statistics:
     *                                    - 'Attendance_rate' (float): The percentage of days attended.
     *                                    - 'total_days' (int): The total number of days in the period.
     *                                    - 'absences' (int): The count of recorded absences in the period.
     *                                    - 'lates' (int): The count of late arrivals in the period.
     *                                    - 'penalty_absences' (int): The penalty absences derived from late arrivals.
     *                                    - 'Adjusted_absences' (int): The total absences including penalties.
     */
    public function summarize(Employee $employee, DateTimeImmutable $start, DateTimeImmutable $end): array
    {
        $lates = $this->attendanceRepository->countLate($employee, $start, $end);
        $absences = $this->attendanceRepository->countAbsent($employee, $start, $end);
        if (0 === $maxLateAllowed = $this->settingService->getInt(SettingConstant::MAXIMUM_LATE_COUNT, 3)) {
            return [
                'attendance_rate' => 0.0,
                'total_days' => 0,
                'absences' => 0,
                'lates' => 0,
                'penalty_absences' => 0,
                'adjusted_absences' => 0,
            ];
        }
        $penaltyAbsences = intdiv($lates, $maxLateAllowed);

        $adjustedAbsences = $absences + $penaltyAbsences;
        $totalDays = DateHelper::daysBetween($start, $end, true);
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

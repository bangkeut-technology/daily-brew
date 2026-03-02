<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Employee;
use App\Entity\Payslip;
use App\Entity\PayrollRun;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\AttendanceTypeEnum;
use App\Enum\LeaveTypeEnum;
use App\Enum\PayrollRunStatusEnum;
use App\Enum\PayslipStatusEnum;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\EmployeeSalaryRepository;
use App\Repository\PayrollRunRepository;
use DateTimeImmutable;
use LogicException;

/**
 * Class PayrollService
 *
 * @package App\Service
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class PayrollService
{
    public function __construct(
        private readonly PayrollRunRepository     $payrollRunRepository,
        private readonly EmployeeRepository       $employeeRepository,
        private readonly EmployeeSalaryRepository $employeeSalaryRepository,
        private readonly AttendanceRepository     $attendanceRepository,
    )
    {
    }

    /**
     * Create and compute a payroll run for the given workspace and period.
     *
     * @param Workspace         $workspace
     * @param DateTimeImmutable $period     First day of the month being processed
     * @param User              $processedBy
     * @return PayrollRun
     */
    public function createPayrollRun(Workspace $workspace, DateTimeImmutable $period, User $processedBy): PayrollRun
    {
        // Normalise period to first day of month
        $period = new DateTimeImmutable($period->format('Y-m-01'));

        $existing = $this->payrollRunRepository->findByWorkspaceAndPeriod($workspace, $period);
        if (null !== $existing && $existing->getStatus() === PayrollRunStatusEnum::FINALIZED) {
            throw new LogicException(sprintf(
                'A finalized payroll run already exists for period %s.',
                $period->format('Y-m')
            ));
        }

        $run = $existing ?? new PayrollRun();
        $run->setWorkspace($workspace);
        $run->setPeriod($period);
        $run->setStatus(PayrollRunStatusEnum::DRAFT);
        $run->setProcessedAt(new DateTimeImmutable());
        $run->setProcessedBy($processedBy);

        // Period boundaries
        $from = $period;
        $to   = new DateTimeImmutable($period->format('Y-m-t')); // last day of month

        // Count working days (Mon-Fri) in period
        $workingDays = $this->countWorkingDays($from, $to);

        // Get all employees in workspace
        $employees = $this->employeeRepository->findBy(['workspace' => $workspace]);

        foreach ($employees as $employee) {
            $salary = $this->employeeSalaryRepository->findByEmployee($employee);
            if (null === $salary) {
                continue;
            }

            $attendances = $this->attendanceRepository->findByEmployeeAndPeriod($employee, $from, $to);

            $presentDays = 0;
            $absentDays = 0;
            $lateDays = 0;
            $paidLeaveDays = 0;
            $unpaidLeaveDays = 0;

            foreach ($attendances as $attendance) {
                match ($attendance->getType()) {
                    AttendanceTypeEnum::PRESENT => $presentDays++,
                    AttendanceTypeEnum::ABSENT => $absentDays++,
                    AttendanceTypeEnum::LATE => $lateDays++,
                    AttendanceTypeEnum::LEAVE => match ($attendance->getLeaveType()) {
                        LeaveTypeEnum::PAID => $paidLeaveDays++,
                        default => $unpaidLeaveDays++,
                    },
                    default => null,
                };
            }

            $baseSalary = (float) $salary->getBaseSalary();

            // Deduction per absent/unpaid-leave day
            $deductionPerDay = $workingDays > 0 ? ($baseSalary / $workingDays) : 0;
            $totalDeductions = round($deductionPerDay * ($absentDays + $unpaidLeaveDays), 2);
            $netPay = round($baseSalary - $totalDeductions, 2);

            $payslip = $this->findOrCreatePayslip($run, $employee);
            $payslip->setWorkspace($workspace);
            $payslip->setBaseSalary((string) $baseSalary);
            $payslip->setCurrency($salary->getCurrency());
            $payslip->setWorkingDays($workingDays);
            $payslip->setPresentDays($presentDays);
            $payslip->setAbsentDays($absentDays);
            $payslip->setLateDays($lateDays);
            $payslip->setPaidLeaveDays($paidLeaveDays);
            $payslip->setUnpaidLeaveDays($unpaidLeaveDays);
            $payslip->setTotalDeductions((string) $totalDeductions);
            // Recalculate net pay including existing allowances
            $totalAllowances = (float) $payslip->getTotalAllowances();
            $payslip->setNetPay((string) round($baseSalary + $totalAllowances - $totalDeductions, 2));
        }

        $this->payrollRunRepository->update($run);

        return $run;
    }

    /**
     * Finalize a payroll run — no further modifications allowed after this.
     *
     * @param PayrollRun $run
     * @return void
     */
    public function finalizePayrollRun(PayrollRun $run): void
    {
        if ($run->getStatus() === PayrollRunStatusEnum::FINALIZED) {
            throw new LogicException('Payroll run is already finalized.');
        }

        $run->setStatus(PayrollRunStatusEnum::FINALIZED);
        $this->payrollRunRepository->update($run);
    }

    /**
     * Mark a payslip as paid.
     *
     * @param Payslip $payslip
     * @return void
     */
    public function markPayslipAsPaid(Payslip $payslip): void
    {
        $payslip->setStatus(PayslipStatusEnum::PAID);
        $payslip->setPaidAt(new DateTimeImmutable());
        $this->payrollRunRepository->flush();
    }

    /**
     * Count Mon-Fri working days in a date range (inclusive).
     */
    private function countWorkingDays(DateTimeImmutable $from, DateTimeImmutable $to): int
    {
        $count = 0;
        $current = $from;
        while ($current <= $to) {
            $dow = (int) $current->format('N'); // 1=Mon … 7=Sun
            if ($dow <= 5) {
                $count++;
            }
            $current = $current->modify('+1 day');
        }

        return $count;
    }

    private function findOrCreatePayslip(PayrollRun $run, Employee $employee): Payslip
    {
        foreach ($run->getPayslips() as $existing) {
            if ($existing->getEmployee() === $employee) {
                return $existing;
            }
        }

        $payslip = new Payslip();
        $payslip->setEmployee($employee);
        $run->addPayslip($payslip);

        return $payslip;
    }
}

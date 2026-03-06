<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\Payslip;
use App\Enum\PayslipStatusEnum;
use DateTimeImmutable;

/**
 * Class PayslipDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class PayslipDTO
{
    use HasEntityMapper;

    public function __construct(
        public readonly int                $id,
        public readonly string             $publicId,
        public readonly EmployeeDTO        $employee,
        public readonly string             $baseSalary,
        public readonly string             $totalAllowances,
        public readonly string             $totalDeductions,
        public readonly string             $netPay,
        public readonly string             $currency,
        public readonly int                $workingDays,
        public readonly int                $presentDays,
        public readonly int                $absentDays,
        public readonly int                $lateDays,
        public readonly int                $paidLeaveDays,
        public readonly int                $unpaidLeaveDays,
        public readonly PayslipStatusEnum  $status,
        public readonly ?DateTimeImmutable $paidAt = null,
        public readonly ?string            $notes = null,
        public array                       $items = [],
        public readonly ?DateTimeImmutable $createdAt = null,
        public readonly ?DateTimeImmutable $updatedAt = null,
        public readonly ?DateTimeImmutable $period = null,
    )
    {
    }

    public static function fromEntity(Payslip $payslip, bool $withItems = true): self
    {
        $dto = new self(
            id: $payslip->id,
            publicId: $payslip->publicId,
            employee: EmployeeDTO::fromEntity($payslip->getEmployee()),
            baseSalary: $payslip->getBaseSalary(),
            totalAllowances: $payslip->getTotalAllowances(),
            totalDeductions: $payslip->getTotalDeductions(),
            netPay: $payslip->getNetPay(),
            currency: $payslip->getCurrency(),
            workingDays: $payslip->getWorkingDays(),
            presentDays: $payslip->getPresentDays(),
            absentDays: $payslip->getAbsentDays(),
            lateDays: $payslip->getLateDays(),
            paidLeaveDays: $payslip->getPaidLeaveDays(),
            unpaidLeaveDays: $payslip->getUnpaidLeaveDays(),
            status: $payslip->getStatus(),
            paidAt: $payslip->getPaidAt(),
            notes: $payslip->getNotes(),
            createdAt: $payslip->getCreatedAt(),
            updatedAt: $payslip->getUpdatedAt(),
            period: $payslip->getPayrollRun()?->getPeriod(),
        );

        if ($withItems) {
            foreach ($payslip->getItems() as $item) {
                $dto->items[] = PayslipItemDTO::fromEntity($item);
            }
        }

        return $dto;
    }
}

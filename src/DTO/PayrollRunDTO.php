<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\PayrollRun;
use App\Enum\PayrollRunStatusEnum;
use DateTimeImmutable;

/**
 * Class PayrollRunDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class PayrollRunDTO
{
    public function __construct(
        public readonly int                   $id,
        public readonly string                $publicId,
        public readonly DateTimeImmutable     $period,
        public readonly PayrollRunStatusEnum  $status,
        public readonly ?DateTimeImmutable    $processedAt = null,
        public readonly ?UserDTO              $processedBy = null,
        public array                          $payslips = [],
        public readonly ?DateTimeImmutable    $createdAt = null,
        public readonly ?DateTimeImmutable    $updatedAt = null,
    )
    {
    }

    public static function fromEntity(PayrollRun $run, bool $withPayslips = false): self
    {
        $dto = new self(
            id: $run->id,
            publicId: $run->publicId,
            period: $run->getPeriod(),
            status: $run->getStatus(),
            processedAt: $run->getProcessedAt(),
            processedBy: $run->getProcessedBy() !== null ? UserDTO::fromEntity($run->getProcessedBy()) : null,
            createdAt: $run->getCreatedAt(),
            updatedAt: $run->getUpdatedAt(),
        );

        if ($withPayslips) {
            foreach ($run->getPayslips() as $payslip) {
                $dto->payslips[] = PayslipDTO::fromEntity($payslip);
            }
        }

        return $dto;
    }
}

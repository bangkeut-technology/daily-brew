<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\EmployeeSalary;
use App\Enum\SalaryTypeEnum;
use DateTimeImmutable;

final readonly class EmployeeSalaryDTO
{
    use HasEntityMapper;

    public function __construct(
        public int                $id,
        public string             $publicId,
        public string             $baseSalary,
        public string             $currency,
        public SalaryTypeEnum     $salaryType,
        public DateTimeImmutable  $effectiveFrom,
        public ?DateTimeImmutable $effectiveTo,
        public ?EmployeeDTO       $employee,
    ) {
    }

    public static function fromEntity(EmployeeSalary $salary, bool $withEmployee = false): self
    {
        return new self(
            id: $salary->id,
            publicId: $salary->publicId,
            baseSalary: $salary->getBaseSalary(),
            currency: $salary->getCurrency(),
            salaryType: $salary->getSalaryType(),
            effectiveFrom: $salary->getEffectiveFrom(),
            effectiveTo: $salary->getEffectiveTo(),
            employee: $withEmployee && $salary->getEmployee()
                ? EmployeeDTO::fromEntity($salary->getEmployee())
                : null,
        );
    }
}

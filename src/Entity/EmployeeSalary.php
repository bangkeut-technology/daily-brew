<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\SalaryTypeEnum;
use App\Repository\EmployeeSalaryRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class EmployeeSalary
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_employee_salaries')]
#[ORM\Entity(repositoryClass: EmployeeSalaryRepository::class)]
class EmployeeSalary extends AbstractEntity
{
    #[ORM\OneToOne(targetEntity: Employee::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Employee $employee = null;

    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['employee_salary:read'])]
    private string $baseSalary = '0.00';

    #[ORM\Column(length: 3)]
    #[Groups(['employee_salary:read'])]
    private string $currency = 'USD';

    #[ORM\Column(enumType: SalaryTypeEnum::class)]
    #[Groups(['employee_salary:read'])]
    private SalaryTypeEnum $salaryType = SalaryTypeEnum::MONTHLY;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups(['employee_salary:read'])]
    private DateTimeImmutable $effectiveFrom;

    #[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: true)]
    #[Groups(['employee_salary:read'])]
    private ?DateTimeImmutable $effectiveTo = null;

    public function getEmployee(): ?Employee
    {
        return $this->employee;
    }

    public function setEmployee(?Employee $employee): static
    {
        $this->employee = $employee;

        return $this;
    }

    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(?Workspace $workspace): static
    {
        $this->workspace = $workspace;

        return $this;
    }

    public function getBaseSalary(): string
    {
        return $this->baseSalary;
    }

    public function setBaseSalary(string $baseSalary): static
    {
        $this->baseSalary = $baseSalary;

        return $this;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function setCurrency(string $currency): static
    {
        $this->currency = $currency;

        return $this;
    }

    public function getSalaryType(): SalaryTypeEnum
    {
        return $this->salaryType;
    }

    public function setSalaryType(SalaryTypeEnum $salaryType): static
    {
        $this->salaryType = $salaryType;

        return $this;
    }

    public function getEffectiveFrom(): DateTimeImmutable
    {
        return $this->effectiveFrom;
    }

    public function setEffectiveFrom(DateTimeImmutable $effectiveFrom): static
    {
        $this->effectiveFrom = $effectiveFrom;

        return $this;
    }

    public function getEffectiveTo(): ?DateTimeImmutable
    {
        return $this->effectiveTo;
    }

    public function setEffectiveTo(?DateTimeImmutable $effectiveTo): static
    {
        $this->effectiveTo = $effectiveTo;

        return $this;
    }
}

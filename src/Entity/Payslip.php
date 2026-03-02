<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\PayslipStatusEnum;
use App\Repository\PayslipRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class Payslip
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_payslips')]
#[ORM\Entity(repositoryClass: PayslipRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_PAYSLIP_RUN_EMPLOYEE', fields: ['payrollRun', 'employee'])]
class Payslip extends AbstractEntity
{
    #[ORM\ManyToOne(targetEntity: PayrollRun::class, inversedBy: 'payslips')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?PayrollRun $payrollRun = null;

    #[ORM\ManyToOne(targetEntity: Employee::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['payslip:read'])]
    private ?Employee $employee = null;

    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['payslip:read'])]
    private string $baseSalary = '0.00';

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['payslip:read'])]
    private string $totalAllowances = '0.00';

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['payslip:read'])]
    private string $totalDeductions = '0.00';

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['payslip:read'])]
    private string $netPay = '0.00';

    #[ORM\Column(length: 3)]
    #[Groups(['payslip:read'])]
    private string $currency = 'USD';

    #[ORM\Column]
    #[Groups(['payslip:read'])]
    private int $workingDays = 0;

    #[ORM\Column]
    #[Groups(['payslip:read'])]
    private int $presentDays = 0;

    #[ORM\Column]
    #[Groups(['payslip:read'])]
    private int $absentDays = 0;

    #[ORM\Column]
    #[Groups(['payslip:read'])]
    private int $lateDays = 0;

    #[ORM\Column]
    #[Groups(['payslip:read'])]
    private int $paidLeaveDays = 0;

    #[ORM\Column]
    #[Groups(['payslip:read'])]
    private int $unpaidLeaveDays = 0;

    #[ORM\Column(enumType: PayslipStatusEnum::class)]
    #[Groups(['payslip:read'])]
    private PayslipStatusEnum $status = PayslipStatusEnum::PENDING;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['payslip:read'])]
    private ?DateTimeImmutable $paidAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['payslip:read'])]
    private ?string $notes = null;

    /**
     * @var Collection<int, PayslipItem>
     */
    #[ORM\OneToMany(targetEntity: PayslipItem::class, mappedBy: 'payslip', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['payslip:read'])]
    private Collection $items;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    public function __construct()
    {
        $this->items = new ArrayCollection();
    }

    public function getPayrollRun(): ?PayrollRun
    {
        return $this->payrollRun;
    }

    public function setPayrollRun(?PayrollRun $payrollRun): static
    {
        $this->payrollRun = $payrollRun;

        return $this;
    }

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

    public function getTotalAllowances(): string
    {
        return $this->totalAllowances;
    }

    public function setTotalAllowances(string $totalAllowances): static
    {
        $this->totalAllowances = $totalAllowances;

        return $this;
    }

    public function getTotalDeductions(): string
    {
        return $this->totalDeductions;
    }

    public function setTotalDeductions(string $totalDeductions): static
    {
        $this->totalDeductions = $totalDeductions;

        return $this;
    }

    public function getNetPay(): string
    {
        return $this->netPay;
    }

    public function setNetPay(string $netPay): static
    {
        $this->netPay = $netPay;

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

    public function getWorkingDays(): int
    {
        return $this->workingDays;
    }

    public function setWorkingDays(int $workingDays): static
    {
        $this->workingDays = $workingDays;

        return $this;
    }

    public function getPresentDays(): int
    {
        return $this->presentDays;
    }

    public function setPresentDays(int $presentDays): static
    {
        $this->presentDays = $presentDays;

        return $this;
    }

    public function getAbsentDays(): int
    {
        return $this->absentDays;
    }

    public function setAbsentDays(int $absentDays): static
    {
        $this->absentDays = $absentDays;

        return $this;
    }

    public function getLateDays(): int
    {
        return $this->lateDays;
    }

    public function setLateDays(int $lateDays): static
    {
        $this->lateDays = $lateDays;

        return $this;
    }

    public function getPaidLeaveDays(): int
    {
        return $this->paidLeaveDays;
    }

    public function setPaidLeaveDays(int $paidLeaveDays): static
    {
        $this->paidLeaveDays = $paidLeaveDays;

        return $this;
    }

    public function getUnpaidLeaveDays(): int
    {
        return $this->unpaidLeaveDays;
    }

    public function setUnpaidLeaveDays(int $unpaidLeaveDays): static
    {
        $this->unpaidLeaveDays = $unpaidLeaveDays;

        return $this;
    }

    public function getStatus(): PayslipStatusEnum
    {
        return $this->status;
    }

    public function setStatus(PayslipStatusEnum $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getPaidAt(): ?DateTimeImmutable
    {
        return $this->paidAt;
    }

    public function setPaidAt(?DateTimeImmutable $paidAt): static
    {
        $this->paidAt = $paidAt;

        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;

        return $this;
    }

    /**
     * @return Collection<int, PayslipItem>
     */
    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(PayslipItem $item): static
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setPayslip($this);
        }

        return $this;
    }

    public function removeItem(PayslipItem $item): static
    {
        if ($this->items->removeElement($item)) {
            if ($item->getPayslip() === $this) {
                $item->setPayslip(null);
            }
        }

        return $this;
    }

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?DateTimeImmutable $deletedAt): static
    {
        $this->deletedAt = $deletedAt;

        return $this;
    }
}

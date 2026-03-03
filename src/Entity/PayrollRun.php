<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\PayrollRunStatusEnum;
use App\Repository\PayrollRunRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class PayrollRun
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_payroll_runs')]
#[ORM\Entity(repositoryClass: PayrollRunRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_PAYROLL_RUN_WORKSPACE_PERIOD', fields: ['workspace', 'period'])]
class PayrollRun extends AbstractEntity
{
    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private DateTimeImmutable $period;

    #[ORM\Column(enumType: PayrollRunStatusEnum::class)]
    private PayrollRunStatusEnum $status = PayrollRunStatusEnum::DRAFT;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $processedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $processedBy = null;

    /**
     * @var Collection<int, Payslip>
     */
    #[ORM\OneToMany(targetEntity: Payslip::class, mappedBy: 'payrollRun', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $payslips;

    public function __construct()
    {
        $this->payslips = new ArrayCollection();
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

    public function getPeriod(): DateTimeImmutable
    {
        return $this->period;
    }

    public function setPeriod(DateTimeImmutable $period): static
    {
        $this->period = $period;

        return $this;
    }

    public function getStatus(): PayrollRunStatusEnum
    {
        return $this->status;
    }

    public function setStatus(PayrollRunStatusEnum $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getProcessedAt(): ?DateTimeImmutable
    {
        return $this->processedAt;
    }

    public function setProcessedAt(?DateTimeImmutable $processedAt): static
    {
        $this->processedAt = $processedAt;

        return $this;
    }

    public function getProcessedBy(): ?User
    {
        return $this->processedBy;
    }

    public function setProcessedBy(?User $processedBy): static
    {
        $this->processedBy = $processedBy;

        return $this;
    }

    /**
     * @return Collection<int, Payslip>
     */
    public function getPayslips(): Collection
    {
        return $this->payslips;
    }

    public function addPayslip(Payslip $payslip): static
    {
        if (!$this->payslips->contains($payslip)) {
            $this->payslips->add($payslip);
            $payslip->setPayrollRun($this);
        }

        return $this;
    }

    public function removePayslip(Payslip $payslip): static
    {
        if ($this->payslips->removeElement($payslip)) {
            if ($payslip->getPayrollRun() === $this) {
                $payslip->setPayrollRun(null);
            }
        }

        return $this;
    }
}

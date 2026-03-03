<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\PayslipItemTypeEnum;
use App\Repository\PayslipItemRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class PayslipItem
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_payslip_items')]
#[ORM\Entity(repositoryClass: PayslipItemRepository::class)]
class PayslipItem extends AbstractEntity
{
    #[ORM\ManyToOne(targetEntity: Payslip::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Payslip $payslip = null;

    #[ORM\Column(enumType: PayslipItemTypeEnum::class)]
    private PayslipItemTypeEnum $type;

    #[ORM\Column(length: 255)]
    private string $label;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private string $amount;

    public function getPayslip(): ?Payslip
    {
        return $this->payslip;
    }

    public function setPayslip(?Payslip $payslip): static
    {
        $this->payslip = $payslip;

        return $this;
    }

    public function getType(): PayslipItemTypeEnum
    {
        return $this->type;
    }

    public function setType(PayslipItemTypeEnum $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function setLabel(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function getAmount(): string
    {
        return $this->amount;
    }

    public function setAmount(string $amount): static
    {
        $this->amount = $amount;

        return $this;
    }
}

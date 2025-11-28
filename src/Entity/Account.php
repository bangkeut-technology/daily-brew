<?php
declare(strict_types=1);


namespace App\Entity;

use App\Enum\PlanEnum;
use App\Repository\AccountRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class Account
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Entity(repositoryClass: AccountRepository::class)]
class Account extends AbstractEntity
{
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $name = null;

    #[ORM\Column(enumType: PlanEnum::class)]
    private ?PlanEnum $plan = null;

    /**
     * @return string|null
     */
    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * @param string|null $name
     * @return Account
     */
    public function setName(?string $name): Account
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return PlanEnum|null
     */
    public function getPlan(): ?PlanEnum
    {
        return $this->plan;
    }

    /**
     * @param PlanEnum|null $plan
     * @return Account
     */
    public function setPlan(?PlanEnum $plan): Account
    {
        $this->plan = $plan;
        return $this;
    }
}

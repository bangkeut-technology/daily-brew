<?php
declare(strict_types=1);


namespace App\Entity;

use App\Enum\PlanEnum;
use App\Repository\AccountRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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
     * @var Collection<int, AccountUser>
     */
    #[ORM\OneToMany(targetEntity: AccountUser::class, mappedBy: 'account')]
    private Collection $users;

    /**
     * @var Collection<int, Store>
     */
    #[ORM\OneToMany(targetEntity: Store::class, mappedBy: 'account')]
    private Collection $stores;

    public function __construct()
    {
        $this->users = new ArrayCollection();
        $this->stores = new ArrayCollection();
    }

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

    /**
     * @return Collection<int, AccountUser>
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(AccountUser $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->setAccount($this);
        }

        return $this;
    }

    public function removeUser(AccountUser $user): static
    {
        if ($this->users->removeElement($user)) {
            // set the owning side to null (unless already changed)
            if ($user->getAccount() === $this) {
                $user->setAccount(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Store>
     */
    public function getStores(): Collection
    {
        return $this->stores;
    }

    public function addStore(Store $store): static
    {
        if (!$this->stores->contains($store)) {
            $this->stores->add($store);
            $store->setAccount($this);
        }

        return $this;
    }

    public function removeStore(Store $store): static
    {
        if ($this->stores->removeElement($store)) {
            // set the owning side to null (unless already changed)
            if ($store->getAccount() === $this) {
                $store->setAccount(null);
            }
        }

        return $this;
    }
}

<?php
declare(strict_types=1);


namespace App\Entity;

use App\Enum\AccountRoleEnum;
use App\Repository\AccountUserRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class AccountUser
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Entity(repositoryClass: AccountUserRepository::class)]
#[ORM\Table(name: 'daily_brew_account_users')]
class AccountUser extends AbstractEntity
{
    #[ORM\Column(enumType: AccountRoleEnum::class)]
    private ?AccountRoleEnum $role = null;

    #[ORM\ManyToOne(inversedBy: 'users')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Account $account = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'accounts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $customName = null;

    public function getRole(): ?AccountRoleEnum
    {
        return $this->role;
    }

    public function setRole(AccountRoleEnum $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function getAccount(): ?Account
    {
        return $this->account;
    }

    public function setAccount(?Account $account): static
    {
        $this->account = $account;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getCustomName(): ?string
    {
        return $this->customName;
    }

    public function setCustomName(?string $customName): static
    {
        $this->customName = $customName;

        return $this;
    }
}

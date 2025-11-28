<?php
declare(strict_types=1);


namespace App\Entity;

use App\Repository\UserSettingRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class UserSetting
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_user_settings')]
#[ORM\Entity(repositoryClass: UserSettingRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_SETTING_NAME', fields: ['name', 'user'])]
class UserSetting extends AbstractEntity
{
    /**
     * @var string|null The name of the setting
     */
    #[ORM\Column(length: 255)]
    #[Groups(['setting:read'])]
    private ?string $name = null;

    /**
     * @var string|null The value of the setting
     */
    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['setting:read'])]
    private ?string $value = null;

    // Optional relation to company or user
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    /**
     * @return string|null
     */
    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * @param string|null $name
     * @return UserSetting
     */
    public function setName(?string $name): UserSetting
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getValue(): ?string
    {
        return $this->value;
    }

    /**
     * @param string|null $value
     * @return UserSetting
     */
    public function setValue(?string $value): UserSetting
    {
        $this->value = $value;
        return $this;
    }

    /**
     * @return User|null
     */
    public function getUser(): ?User
    {
        return $this->user;
    }

    /**
     * @param User|null $user
     * @return UserSetting
     */
    public function setUser(?User $user): UserSetting
    {
        $this->user = $user;
        return $this;
    }
}

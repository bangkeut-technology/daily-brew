<?php
declare(strict_types=1);


namespace App\Entity;

use App\Repository\SettingRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class Setting
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_settings')]
#[ORM\Entity(repositoryClass: SettingRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_SETTING_NAME', fields: ['name'])]
class Setting extends AbstractEntity
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
    private ?User $owner = null;

    /**
     * @return string|null
     */
    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * @param string|null $name
     * @return Setting
     */
    public function setName(?string $name): Setting
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
     * @return Setting
     */
    public function setValue(?string $value): Setting
    {
        $this->value = $value;
        return $this;
    }

    /**
     * @return User|null
     */
    public function getOwner(): ?User
    {
        return $this->owner;
    }

    /**
     * @param User|null $owner
     * @return Setting
     */
    public function setOwner(?User $owner): Setting
    {
        $this->owner = $owner;
        return $this;
    }
}

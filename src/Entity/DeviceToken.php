<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\DeviceTokenRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DeviceTokenRepository::class)]
#[ORM\Table(name: 'daily_brew_device_tokens')]
#[ORM\UniqueConstraint(name: 'UNIQ_DEVICE_TOKEN', fields: ['token'])]
#[ORM\HasLifecycleCallbacks]
class DeviceToken extends AbstractBaseEntity
{
    #[ORM\Column(length: 255)]
    private string $token;

    #[ORM\Column(length: 20)]
    private string $platform;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    public function __construct()
    {
        parent::__construct();
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function setToken(string $token): self
    {
        $this->token = $token;

        return $this;
    }

    public function getPlatform(): string
    {
        return $this->platform;
    }

    public function setPlatform(string $platform): self
    {
        $this->platform = $platform;

        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }
}

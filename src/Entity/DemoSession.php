<?php
declare(strict_types=1);

namespace App\Entity;

use App\Repository\DemoSessionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'daily_brew_demo_session')]
#[ORM\Entity(repositoryClass: DemoSessionRepository::class)]
class DemoSession extends AbstractEntity
{
    #[ORM\Column]
    private ?int $deviceId = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $expiresAt = null;

    #[ORM\Column]
    private ?bool $active = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    public function getDeviceId(): ?int
    {
        return $this->deviceId;
    }

    public function setDeviceId(int $deviceId): static
    {
        $this->deviceId = $deviceId;

        return $this;
    }

    public function getExpiresAt(): ?\DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->active;
    }

    public function setActive(bool $active): static
    {
        $this->active = $active;

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
}

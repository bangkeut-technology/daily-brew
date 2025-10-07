<?php
declare(strict_types=1);

namespace App\Entity;

use App\Repository\DemoSessionRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class DemoSession
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_demo_session')]
#[ORM\Entity(repositoryClass: DemoSessionRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_DEMO_SESSION_DEVICE_ID', fields: ['deviceId'])]
#[ORM\HasLifecycleCallbacks]
class DemoSession extends AbstractEntity
{
    public function __construct(
        #[ORM\Column]
        #[Groups('demo_session:read')]
        private ?string            $deviceId = null,
        #[ORM\Column]
        #[Groups('demo_session:read')]
        private ?DateTimeImmutable $expiresAt = null,
        #[ORM\Column]
        #[Groups('demo_session:read')]
        private ?bool              $active = null,
        #[ORM\ManyToOne]
        #[ORM\JoinColumn(nullable: false)]
        #[Groups('demo_session:read')]
        private ?User              $user = null,
    )
    {
    }

    /**
     * @return string|null
     */
    public function getDeviceId(): ?string
    {
        return $this->deviceId;
    }

    /**
     * @param string|null $deviceId
     * @return DemoSession
     */
    public function setDeviceId(?string $deviceId): DemoSession
    {
        $this->deviceId = $deviceId;
        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getExpiresAt(): ?DateTimeImmutable
    {
        return $this->expiresAt;
    }

    /**
     * @param DateTimeImmutable|null $expiresAt
     * @return DemoSession
     */
    public function setExpiresAt(?DateTimeImmutable $expiresAt): DemoSession
    {
        $this->expiresAt = $expiresAt;
        return $this;
    }

    /**
     * @return bool|null
     */
    public function getActive(): ?bool
    {
        return $this->active;
    }

    /**
     * @param bool|null $active
     * @return DemoSession
     */
    public function setActive(?bool $active): DemoSession
    {
        $this->active = $active;
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
     * @return DemoSession
     */
    public function setUser(?User $user): DemoSession
    {
        $this->user = $user;
        return $this;
    }
}

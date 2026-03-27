<?php

namespace App\Entity;

use App\Enum\PlanEnum;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\SubscriptionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SubscriptionRepository::class)]
#[ORM\Table(name: 'daily_brew_subscriptions')]
#[ORM\UniqueConstraint(name: 'UNIQ_SUBSCRIPTION_WORKSPACE', fields: ['workspace'])]
class Subscription extends AbstractBaseEntity
{
    #[ORM\OneToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Workspace $workspace;

    #[ORM\Column(length: 20, enumType: PlanEnum::class)]
    private PlanEnum $plan = PlanEnum::Free;

    #[ORM\Column(length: 20, enumType: SubscriptionStatusEnum::class)]
    private SubscriptionStatusEnum $status = SubscriptionStatusEnum::Active;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $paddleSubscriptionId = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $paddleCustomerId = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $currentPeriodEnd = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $canceledAt = null;

    public function getWorkspace(): Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(Workspace $workspace): static
    {
        $this->workspace = $workspace;
        return $this;
    }

    public function getPlan(): PlanEnum
    {
        return $this->plan;
    }

    public function setPlan(PlanEnum $plan): static
    {
        $this->plan = $plan;
        return $this;
    }

    public function getStatus(): SubscriptionStatusEnum
    {
        return $this->status;
    }

    public function setStatus(SubscriptionStatusEnum $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getPaddleSubscriptionId(): ?string
    {
        return $this->paddleSubscriptionId;
    }

    public function setPaddleSubscriptionId(?string $paddleSubscriptionId): static
    {
        $this->paddleSubscriptionId = $paddleSubscriptionId;
        return $this;
    }

    public function getPaddleCustomerId(): ?string
    {
        return $this->paddleCustomerId;
    }

    public function setPaddleCustomerId(?string $paddleCustomerId): static
    {
        $this->paddleCustomerId = $paddleCustomerId;
        return $this;
    }

    public function getCurrentPeriodEnd(): ?\DateTimeInterface
    {
        return $this->currentPeriodEnd;
    }

    public function setCurrentPeriodEnd(?\DateTimeInterface $currentPeriodEnd): static
    {
        $this->currentPeriodEnd = $currentPeriodEnd;
        return $this;
    }

    public function getCanceledAt(): ?\DateTimeInterface
    {
        return $this->canceledAt;
    }

    public function setCanceledAt(?\DateTimeInterface $canceledAt): static
    {
        $this->canceledAt = $canceledAt;
        return $this;
    }

    public function isEspresso(): bool
    {
        return $this->plan === PlanEnum::Espresso
            && in_array($this->status, [SubscriptionStatusEnum::Active, SubscriptionStatusEnum::Trialing]);
    }
}

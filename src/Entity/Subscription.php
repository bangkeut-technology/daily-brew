<?php

namespace App\Entity;

use App\Enum\Plan;
use App\Enum\SubscriptionStatus;
use App\Repository\SubscriptionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SubscriptionRepository::class)]
class Subscription extends AbstractBaseEntity
{
    #[ORM\OneToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: false, unique: true)]
    private Workspace $workspace;

    #[ORM\Column(length: 20, enumType: Plan::class)]
    private Plan $plan = Plan::Free;

    #[ORM\Column(length: 20, enumType: SubscriptionStatus::class)]
    private SubscriptionStatus $status = SubscriptionStatus::Active;

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

    public function getPlan(): Plan
    {
        return $this->plan;
    }

    public function setPlan(Plan $plan): static
    {
        $this->plan = $plan;
        return $this;
    }

    public function getStatus(): SubscriptionStatus
    {
        return $this->status;
    }

    public function setStatus(SubscriptionStatus $status): static
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

    public function isBrewPlus(): bool
    {
        return $this->plan === Plan::BrewPlus
            && in_array($this->status, [SubscriptionStatus::Active, SubscriptionStatus::Trialing]);
    }
}

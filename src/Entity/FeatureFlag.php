<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\FeatureFlagEnum;
use App\Repository\FeatureFlagRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Persistent state for a single feature flag. The flag catalog lives in
 * FeatureFlagEnum — this row just stores which ones are currently enabled.
 */
#[ORM\Table(name: 'daily_brew_feature_flags')]
#[ORM\Entity(repositoryClass: FeatureFlagRepository::class)]
class FeatureFlag extends AbstractBaseEntity
{
    #[ORM\Column(length: 64, unique: true)]
    private string $flagKey;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $enabled = false;

    public function __construct(FeatureFlagEnum $flag, bool $enabled = false)
    {
        parent::__construct();
        $this->flagKey = $flag->value;
        $this->enabled = $enabled;
    }

    public function getFlagKey(): string
    {
        return $this->flagKey;
    }

    public function getFlag(): ?FeatureFlagEnum
    {
        return FeatureFlagEnum::tryFrom($this->flagKey);
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): static
    {
        $this->enabled = $enabled;
        return $this;
    }
}

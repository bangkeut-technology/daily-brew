<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\FeatureFlagEnum;
use App\Enum\FeatureFlagStageEnum;
use App\Repository\FeatureFlagRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Persistent state for a single feature flag. The flag catalog lives in
 * FeatureFlagEnum — this row stores the current release stage.
 */
#[ORM\Table(name: 'daily_brew_feature_flags')]
#[ORM\Entity(repositoryClass: FeatureFlagRepository::class)]
class FeatureFlag extends AbstractBaseEntity
{
    #[ORM\Column(length: 64, unique: true)]
    private string $flagKey;

    #[ORM\Column(type: 'string', length: 16, enumType: FeatureFlagStageEnum::class)]
    private FeatureFlagStageEnum $stage = FeatureFlagStageEnum::Dev;

    public function __construct(FeatureFlagEnum $flag, FeatureFlagStageEnum $stage = FeatureFlagStageEnum::Dev)
    {
        parent::__construct();
        $this->flagKey = $flag->value;
        $this->stage = $stage;
    }

    public function getFlagKey(): string
    {
        return $this->flagKey;
    }

    public function getFlag(): ?FeatureFlagEnum
    {
        return FeatureFlagEnum::tryFrom($this->flagKey);
    }

    public function getStage(): FeatureFlagStageEnum
    {
        return $this->stage;
    }

    public function setStage(FeatureFlagStageEnum $stage): static
    {
        $this->stage = $stage;
        return $this;
    }
}

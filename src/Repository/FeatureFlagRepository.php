<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\FeatureFlag;
use App\Enum\FeatureFlagEnum;
use App\Enum\FeatureFlagStageEnum;
use Doctrine\Persistence\ManagerRegistry;

class FeatureFlagRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FeatureFlag::class);
    }

    public function findByFlag(FeatureFlagEnum $flag): ?FeatureFlag
    {
        return $this->findOneBy(['flagKey' => $flag->value]);
    }

    /**
     * Returns a map of every flag in the catalog to its current stage.
     * Missing rows fall back to FeatureFlagEnum::defaultStage().
     *
     * @return array<string, FeatureFlagStageEnum>
     */
    public function getAllStages(): array
    {
        $rows = $this->findAll();
        $byKey = [];
        foreach ($rows as $row) {
            $byKey[$row->getFlagKey()] = $row->getStage();
        }
        $stages = [];
        foreach (FeatureFlagEnum::cases() as $case) {
            $stages[$case->value] = $byKey[$case->value] ?? $case->defaultStage();
        }
        return $stages;
    }
}

<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\FeatureFlag;
use App\Enum\FeatureFlagEnum;
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
     * Returns a map of every flag in the catalog to its current state.
     * Missing rows fall back to FeatureFlagEnum::defaultEnabled().
     *
     * @return array<string, bool>
     */
    public function getAllStates(): array
    {
        $rows = $this->findAll();
        $byKey = [];
        foreach ($rows as $row) {
            $byKey[$row->getFlagKey()] = $row->isEnabled();
        }
        $states = [];
        foreach (FeatureFlagEnum::cases() as $case) {
            $states[$case->value] = $byKey[$case->value] ?? $case->defaultEnabled();
        }
        return $states;
    }
}

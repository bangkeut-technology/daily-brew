<?php

declare(strict_types=1);

namespace App\Service;

use App\Enum\FeatureFlagEnum;
use App\Repository\FeatureFlagRepository;

/**
 * Read API for feature flags. Other services / controllers call
 * isEnabled() to gate code paths. Results are cached per request to
 * avoid hammering the DB on hot paths like CheckinController.
 */
class FeatureFlagService
{
    /** @var array<string, bool> */
    private array $cache = [];

    public function __construct(
        private readonly FeatureFlagRepository $repository,
    ) {
    }

    public function isEnabled(FeatureFlagEnum $flag): bool
    {
        if (array_key_exists($flag->value, $this->cache)) {
            return $this->cache[$flag->value];
        }

        $row = $this->repository->findByFlag($flag);
        $enabled = $row?->isEnabled() ?? $flag->defaultEnabled();
        $this->cache[$flag->value] = $enabled;
        return $enabled;
    }

    /** @return array<string, bool> */
    public function all(): array
    {
        return $this->repository->getAllStates();
    }

    /**
     * Invalidates the per-request cache. Called after a write so a
     * subsequent read in the same request reflects the update.
     */
    public function flushCache(): void
    {
        $this->cache = [];
    }
}

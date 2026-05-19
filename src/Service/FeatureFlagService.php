<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Workspace;
use App\Enum\FeatureFlagEnum;
use App\Enum\FeatureFlagStageEnum;
use App\Enum\WorkspaceTestingTrackEnum;
use App\Repository\FeatureFlagRepository;

/**
 * Read API for feature flags. Other services / controllers call
 * isEnabledForWorkspace() (or isEnabledGlobally() when there's no
 * workspace context) to gate code paths.
 *
 * Visibility rules — given a flag's stage and a workspace's track:
 *
 *   stage / track | none | alpha | beta
 *   --------------|------|-------|------
 *   dev           |   .  |   ✓*  |   .
 *   alpha         |   .  |   ✓   |   .
 *   beta          |   .  |   ✓   |   ✓
 *   release       |   ✓  |   ✓   |   ✓
 *
 * *Dev-stage flags require the development environment AND an alpha
 * workspace, so they can't accidentally leak in production.
 *
 * The per-stage lookup is cached per-request — the underlying state
 * doesn't change mid-request, and other gates (PlanService::canUse*,
 * CheckinController::status) hit isEnabled* on every call.
 */
class FeatureFlagService
{
    /** @var array<string, FeatureFlagStageEnum> */
    private array $cache = [];
    private bool $cacheLoaded = false;

    public function __construct(
        private readonly FeatureFlagRepository $repository,
        private readonly string $kernelEnvironment = 'prod',
    ) {
    }

    public function getStage(FeatureFlagEnum $flag): FeatureFlagStageEnum
    {
        if (!$this->cacheLoaded) {
            $this->cache = $this->repository->getAllStages();
            $this->cacheLoaded = true;
        }
        return $this->cache[$flag->value] ?? $flag->defaultStage();
    }

    public function isEnabledForWorkspace(FeatureFlagEnum $flag, ?Workspace $workspace): bool
    {
        $stage = $this->getStage($flag);
        $track = $workspace?->getTestingTrack() ?? WorkspaceTestingTrackEnum::None;
        return $this->canSeeStage($stage, $track);
    }

    /**
     * Visibility check without a workspace context (anonymous visitors,
     * public marketing pages). Only release-stage flags qualify.
     */
    public function isEnabledGlobally(FeatureFlagEnum $flag): bool
    {
        return $this->getStage($flag) === FeatureFlagStageEnum::Release;
    }

    /**
     * Resolves every flag to a boolean for the given workspace. Used by
     * the GET /features endpoint so the frontend gets one map.
     *
     * @return array<string, bool>
     */
    public function resolveAllForWorkspace(?Workspace $workspace): array
    {
        $stages = $this->getAllStages();
        $track = $workspace?->getTestingTrack() ?? WorkspaceTestingTrackEnum::None;

        $out = [];
        foreach ($stages as $key => $stage) {
            $out[$key] = $this->canSeeStage($stage, $track);
        }
        return $out;
    }

    /** @return array<string, FeatureFlagStageEnum> */
    public function getAllStages(): array
    {
        if (!$this->cacheLoaded) {
            $this->cache = $this->repository->getAllStages();
            $this->cacheLoaded = true;
        }
        return $this->cache;
    }

    public function flushCache(): void
    {
        $this->cache = [];
        $this->cacheLoaded = false;
    }

    private function canSeeStage(FeatureFlagStageEnum $stage, WorkspaceTestingTrackEnum $track): bool
    {
        return match ($stage) {
            FeatureFlagStageEnum::Release => true,
            FeatureFlagStageEnum::Beta => $track === WorkspaceTestingTrackEnum::Alpha
                || $track === WorkspaceTestingTrackEnum::Beta,
            FeatureFlagStageEnum::Alpha => $track === WorkspaceTestingTrackEnum::Alpha,
            FeatureFlagStageEnum::Dev => $this->kernelEnvironment === 'dev'
                && $track === WorkspaceTestingTrackEnum::Alpha,
        };
    }
}

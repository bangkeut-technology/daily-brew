<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Catalog of platform-level feature flags edited by super-admins at
 * /admin/feature-flags. Each case represents an experimental or staged
 * module that's deployed but should ramp through a release stage
 * (dev → alpha → beta → release) before going to every workspace.
 *
 * Flags are independent of plan gates (Espresso, Double Espresso). The
 * plan gate decides which subscribers can use a feature; the stage
 * decides which workspaces the feature exists for at all.
 *
 * Add a new case here, then pass it through FeatureFlagService::isEnabled
 * (workspace-aware) or ::resolveAllForWorkspace. The admin UI auto-
 * discovers cases via cases().
 */
enum FeatureFlagEnum: string
{
    case NfcCheckin = 'nfc_checkin';

    public function label(): string
    {
        return match ($this) {
            self::NfcCheckin => 'NFC check-in',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::NfcCheckin => 'NFC tag check-in for employees on Espresso. When this flag is hidden, the workspace toggle, dashboard NFC card, copy-URL row, guides hub card, and mobile button all stay hidden.',
        };
    }

    /**
     * Default stage if the database row hasn't been seeded yet. New flags
     * start at Dev so they stay hidden in production by default.
     */
    public function defaultStage(): FeatureFlagStageEnum
    {
        return FeatureFlagStageEnum::Dev;
    }
}

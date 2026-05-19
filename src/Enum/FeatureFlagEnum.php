<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Catalog of platform-level feature flags edited by super-admins at
 * /admin/feature-flags. Each case represents an experimental or staged
 * module that's been deployed but should stay dark until the platform
 * admin explicitly enables it.
 *
 * Flags are independent of workspace plan gates (Espresso, Double
 * Espresso). The plan gate decides which subscribers can use a feature;
 * this flag decides whether the feature exists in the product at all.
 *
 * Add a new case here, then pass it through FeatureFlagService::isEnabled.
 * The admin UI auto-discovers cases via cases().
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
            self::NfcCheckin => 'NFC tag check-in for employees on Espresso. When off, the workspace toggle, dashboard link, copy-URL row, guides hub card, and mobile button all stay hidden. Turn on once tag-writing instructions are ready to share with owners.',
        };
    }

    /**
     * Default state if the database row hasn't been seeded yet. Almost
     * always false — flags are off by default so the feature stays dark
     * until an admin opts in.
     */
    public function defaultEnabled(): bool
    {
        return false;
    }
}

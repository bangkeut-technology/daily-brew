<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Release stage a feature flag is currently at. Decides which workspaces
 * see the feature, in combination with Workspace.testingTrack:
 *
 *   stage / track | none | alpha | beta
 *   --------------|------|-------|------
 *   dev           |   .  |   ✓   |   .   (dev-environment-only)
 *   alpha         |   .  |   ✓   |   .
 *   beta          |   .  |   ✓   |   ✓
 *   release       |   ✓  |   ✓   |   ✓
 *
 * Alpha testers see everything the beta track sees plus alpha-stage
 * surfaces; beta testers see beta + release; non-testers see release
 * only. Dev-stage flags are gated to the development environment to
 * keep half-finished UIs out of production entirely.
 */
enum FeatureFlagStageEnum: string
{
    case Dev = 'dev';
    case Alpha = 'alpha';
    case Beta = 'beta';
    case Release = 'release';

    public function label(): string
    {
        return match ($this) {
            self::Dev => 'Dev',
            self::Alpha => 'Alpha',
            self::Beta => 'Beta',
            self::Release => 'Release',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Dev => 'Dev environment only. Code is shipped to prod but the UI stays hidden everywhere.',
            self::Alpha => 'Visible to alpha-tester workspaces only.',
            self::Beta => 'Visible to alpha and beta-tester workspaces.',
            self::Release => 'Visible to every workspace.',
        };
    }
}

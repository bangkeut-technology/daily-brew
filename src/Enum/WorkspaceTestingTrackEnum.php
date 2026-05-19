<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Testing track a workspace opts into for early access to feature-flagged
 * surfaces. Set by a super-admin from the admin workspace detail page.
 *
 *   None  — production-only (sees release-stage features).
 *   Alpha — earliest cohort (sees dev + alpha + beta + release).
 *   Beta  — broader pre-release (sees beta + release).
 */
enum WorkspaceTestingTrackEnum: string
{
    case None = 'none';
    case Alpha = 'alpha';
    case Beta = 'beta';

    public function label(): string
    {
        return match ($this) {
            self::None => 'No testing track',
            self::Alpha => 'Alpha tester',
            self::Beta => 'Beta tester',
        };
    }
}

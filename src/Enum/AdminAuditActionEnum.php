<?php

declare(strict_types=1);

namespace App\Enum;

enum AdminAuditActionEnum: string
{
    case PromoteUser = 'promote_user';
    case DemoteUser = 'demote_user';
    case CancelSubscription = 'cancel_subscription';
    case RestoreWorkspace = 'restore_workspace';
    case UpdateMobileAppConfig = 'update_mobile_app_config';
    case UpdateWorkspaceTestingTrack = 'update_workspace_testing_track';
    case UpdateWorkspacePlan = 'update_workspace_plan';

    public function label(): string
    {
        return match ($this) {
            self::PromoteUser => 'Promoted user',
            self::DemoteUser => 'Demoted user',
            self::CancelSubscription => 'Canceled subscription',
            self::RestoreWorkspace => 'Restored workspace',
            self::UpdateMobileAppConfig => 'Updated mobile app config',
            self::UpdateWorkspaceTestingTrack => 'Updated workspace testing track',
            self::UpdateWorkspacePlan => 'Updated workspace plan',
        };
    }
}

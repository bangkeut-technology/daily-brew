<?php

declare(strict_types=1);

namespace App\Enum;

enum AdminAuditTargetTypeEnum: string
{
    case User = 'user';
    case Workspace = 'workspace';
    case Subscription = 'subscription';
    case MobileAppConfig = 'mobile_app_config';

    public function label(): string
    {
        return match ($this) {
            self::User => 'User',
            self::Workspace => 'Workspace',
            self::Subscription => 'Subscription',
            self::MobileAppConfig => 'Mobile app config',
        };
    }
}

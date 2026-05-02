<?php

declare(strict_types=1);

namespace App\Enum;

enum AdminAuditTargetTypeEnum: string
{
    case User = 'user';
    case Workspace = 'workspace';
    case Subscription = 'subscription';
}

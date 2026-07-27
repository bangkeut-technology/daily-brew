<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\AdminAuditTargetTypeEnum;
use PHPUnit\Framework\TestCase;

class AdminAuditTargetTypeEnumTest extends TestCase
{
    public function testValues(): void
    {
        $this->assertSame('user', AdminAuditTargetTypeEnum::User->value);
        $this->assertSame('workspace', AdminAuditTargetTypeEnum::Workspace->value);
        $this->assertSame('subscription', AdminAuditTargetTypeEnum::Subscription->value);
        $this->assertSame('mobile_app_config', AdminAuditTargetTypeEnum::MobileAppConfig->value);
    }

    public function testLabels(): void
    {
        $this->assertSame('User', AdminAuditTargetTypeEnum::User->label());
        $this->assertSame('Workspace', AdminAuditTargetTypeEnum::Workspace->label());
        $this->assertSame('Subscription', AdminAuditTargetTypeEnum::Subscription->label());
        $this->assertSame('Mobile app config', AdminAuditTargetTypeEnum::MobileAppConfig->label());
    }

    public function testEveryCaseHasANonEmptyLabel(): void
    {
        // The audit-log target filter is built from cases() + label().
        foreach (AdminAuditTargetTypeEnum::cases() as $case) {
            $this->assertNotSame('', $case->label(), "Missing label for {$case->value}");
        }
    }
}

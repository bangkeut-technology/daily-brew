<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\AdminAuditActionEnum;
use PHPUnit\Framework\TestCase;

class AdminAuditActionEnumTest extends TestCase
{
    public function testValues(): void
    {
        $this->assertSame('promote_user', AdminAuditActionEnum::PromoteUser->value);
        $this->assertSame('demote_user', AdminAuditActionEnum::DemoteUser->value);
        $this->assertSame('cancel_subscription', AdminAuditActionEnum::CancelSubscription->value);
        $this->assertSame('restore_workspace', AdminAuditActionEnum::RestoreWorkspace->value);
    }

    public function testLabels(): void
    {
        $this->assertSame('Promoted user', AdminAuditActionEnum::PromoteUser->label());
        $this->assertSame('Demoted user', AdminAuditActionEnum::DemoteUser->label());
        $this->assertSame('Canceled subscription', AdminAuditActionEnum::CancelSubscription->label());
        $this->assertSame('Restored workspace', AdminAuditActionEnum::RestoreWorkspace->label());
    }
}

<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\AdminAuditTargetTypeEnum;
use App\Enum\OAuthProviderEnum;
use App\Enum\SubscriptionStatusEnum;
use App\Enum\UserRoleEnum;
use PHPUnit\Framework\TestCase;

/**
 * Catch-all coverage for the remaining value-only enums. Locking in their string
 * values prevents accidental renames that would silently break persisted rows
 * (Doctrine stores the `value`, not the case name).
 */
class SimpleValueEnumsTest extends TestCase
{
    public function testUserRoleValues(): void
    {
        $this->assertSame('ROLE_USER', UserRoleEnum::DEFAULT->value);
        $this->assertSame('ROLE_SUPER_ADMIN', UserRoleEnum::SUPER_ADMIN->value);
        $this->assertCount(2, UserRoleEnum::cases());
    }

    public function testSubscriptionStatusValuesMatchPaddleWebhookContract(): void
    {
        // These exact strings are sent by Paddle webhooks and stored in DB —
        // changing them silently breaks subscription state.
        $this->assertSame('active', SubscriptionStatusEnum::Active->value);
        $this->assertSame('past_due', SubscriptionStatusEnum::PastDue->value);
        $this->assertSame('canceled', SubscriptionStatusEnum::Canceled->value);
        $this->assertSame('paused', SubscriptionStatusEnum::Paused->value);
        $this->assertSame('trialing', SubscriptionStatusEnum::Trialing->value);
        $this->assertCount(5, SubscriptionStatusEnum::cases());
    }

    public function testSubscriptionStatusTryFromKnownAndUnknown(): void
    {
        $this->assertSame(SubscriptionStatusEnum::Active, SubscriptionStatusEnum::tryFrom('active'));
        $this->assertSame(SubscriptionStatusEnum::PastDue, SubscriptionStatusEnum::tryFrom('past_due'));
        $this->assertNull(SubscriptionStatusEnum::tryFrom('expired'));
    }

    public function testOAuthProviderValues(): void
    {
        $this->assertSame('apple', OAuthProviderEnum::APPLE->value);
        $this->assertSame('google', OAuthProviderEnum::GOOGLE->value);
        $this->assertCount(2, OAuthProviderEnum::cases());
    }

    public function testAdminAuditTargetTypeValues(): void
    {
        $this->assertSame('user', AdminAuditTargetTypeEnum::User->value);
        $this->assertSame('workspace', AdminAuditTargetTypeEnum::Workspace->value);
        $this->assertSame('subscription', AdminAuditTargetTypeEnum::Subscription->value);
        $this->assertCount(3, AdminAuditTargetTypeEnum::cases());
    }
}

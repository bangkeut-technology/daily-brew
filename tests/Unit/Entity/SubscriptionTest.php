<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Subscription;
use App\Entity\Workspace;
use App\Enum\PlanEnum;
use App\Enum\SubscriptionStatusEnum;
use PHPUnit\Framework\TestCase;

class SubscriptionTest extends TestCase
{
    public function testDefaultValues(): void
    {
        $subscription = new Subscription();

        $this->assertSame(PlanEnum::Free, $subscription->getPlan());
        $this->assertSame(SubscriptionStatusEnum::Active, $subscription->getStatus());
        $this->assertNull($subscription->getPaddleSubscriptionId());
        $this->assertNull($subscription->getPaddleCustomerId());
        $this->assertNull($subscription->getCurrentPeriodEnd());
        $this->assertNull($subscription->getTrialEndsAt());
        $this->assertNull($subscription->getCanceledAt());
    }

    public function testIsActiveWhenActive(): void
    {
        $subscription = new Subscription();
        $subscription->setStatus(SubscriptionStatusEnum::Active);

        $this->assertTrue($subscription->isActive());
    }

    public function testIsActiveWhenTrialing(): void
    {
        $subscription = new Subscription();
        $subscription->setStatus(SubscriptionStatusEnum::Trialing);

        $this->assertTrue($subscription->isActive());
    }

    public function testIsNotActiveWhenCanceled(): void
    {
        $subscription = new Subscription();
        $subscription->setStatus(SubscriptionStatusEnum::Canceled);

        $this->assertFalse($subscription->isActive());
    }

    public function testIsNotActiveWhenPaused(): void
    {
        $subscription = new Subscription();
        $subscription->setStatus(SubscriptionStatusEnum::Paused);

        $this->assertFalse($subscription->isActive());
    }

    public function testIsNotActiveWhenPastDue(): void
    {
        $subscription = new Subscription();
        $subscription->setStatus(SubscriptionStatusEnum::PastDue);

        $this->assertFalse($subscription->isActive());
    }

    public function testGetActivePlanReturnsFreWhenInactive(): void
    {
        $subscription = new Subscription();
        $subscription->setPlan(PlanEnum::Espresso);
        $subscription->setStatus(SubscriptionStatusEnum::Canceled);

        $this->assertSame(PlanEnum::Free, $subscription->getActivePlan());
    }

    public function testGetActivePlanReturnsPlanWhenActive(): void
    {
        $subscription = new Subscription();
        $subscription->setPlan(PlanEnum::Espresso);
        $subscription->setStatus(SubscriptionStatusEnum::Active);

        $this->assertSame(PlanEnum::Espresso, $subscription->getActivePlan());
    }

    public function testIsEspressoWithEspressoPlan(): void
    {
        $subscription = new Subscription();
        $subscription->setPlan(PlanEnum::Espresso);
        $subscription->setStatus(SubscriptionStatusEnum::Active);

        $this->assertTrue($subscription->isEspresso());
    }

    public function testIsEspressoWithDoubleEspressoPlan(): void
    {
        $subscription = new Subscription();
        $subscription->setPlan(PlanEnum::DoubleEspresso);
        $subscription->setStatus(SubscriptionStatusEnum::Active);

        $this->assertTrue($subscription->isEspresso());
    }

    public function testIsEspressoReturnsFalseWhenInactive(): void
    {
        $subscription = new Subscription();
        $subscription->setPlan(PlanEnum::Espresso);
        $subscription->setStatus(SubscriptionStatusEnum::Canceled);

        $this->assertFalse($subscription->isEspresso());
    }

    public function testIsTrialing(): void
    {
        $subscription = new Subscription();
        $subscription->setStatus(SubscriptionStatusEnum::Trialing);

        $this->assertTrue($subscription->isTrialing());
    }

    public function testTrialDaysRemainingWhenNotTrialing(): void
    {
        $subscription = new Subscription();
        $subscription->setStatus(SubscriptionStatusEnum::Active);

        $this->assertNull($subscription->getTrialDaysRemaining());
    }

    public function testTrialDaysRemainingWhenTrialing(): void
    {
        $subscription = new Subscription();
        $subscription->setStatus(SubscriptionStatusEnum::Trialing);
        $subscription->setTrialEndsAt(new \DateTime('+5 days'));

        $remaining = $subscription->getTrialDaysRemaining();
        $this->assertNotNull($remaining);
        $this->assertGreaterThanOrEqual(5, $remaining);
        $this->assertLessThanOrEqual(6, $remaining);
    }

    public function testTrialDaysRemainingWhenExpired(): void
    {
        $subscription = new Subscription();
        $subscription->setStatus(SubscriptionStatusEnum::Trialing);
        $subscription->setTrialEndsAt(new \DateTime('-1 day'));

        $this->assertSame(0, $subscription->getTrialDaysRemaining());
    }
}

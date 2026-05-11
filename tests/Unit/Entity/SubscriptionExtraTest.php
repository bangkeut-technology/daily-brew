<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Subscription;
use App\Enum\PlanEnum;
use App\Enum\SubscriptionStatusEnum;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

/**
 * Targeted coverage for helper methods on Subscription that aren't exercised
 * by SubscriptionTest (which focuses on Paddle webhook flows).
 */
class SubscriptionExtraTest extends TestCase
{
    public function testIsActiveTrueForActiveOrTrialingStatuses(): void
    {
        $this->assertTrue($this->subscription(SubscriptionStatusEnum::Active)->isActive());
        $this->assertTrue($this->subscription(SubscriptionStatusEnum::Trialing)->isActive());
    }

    public function testIsActiveFalseForCanceledPausedPastDue(): void
    {
        $this->assertFalse($this->subscription(SubscriptionStatusEnum::Canceled)->isActive());
        $this->assertFalse($this->subscription(SubscriptionStatusEnum::Paused)->isActive());
        $this->assertFalse($this->subscription(SubscriptionStatusEnum::PastDue)->isActive());
    }

    public function testIsTrialingTrueOnlyForTrialingStatus(): void
    {
        $this->assertTrue($this->subscription(SubscriptionStatusEnum::Trialing)->isTrialing());
        $this->assertFalse($this->subscription(SubscriptionStatusEnum::Active)->isTrialing());
    }

    public function testGetActivePlanReturnsStoredPlanWhenActive(): void
    {
        $sub = $this->subscription(SubscriptionStatusEnum::Active, PlanEnum::Espresso);

        $this->assertSame(PlanEnum::Espresso, $sub->getActivePlan());
    }

    public function testGetActivePlanReturnsStoredPlanWhenTrialing(): void
    {
        $sub = $this->subscription(SubscriptionStatusEnum::Trialing, PlanEnum::DoubleEspresso);

        $this->assertSame(PlanEnum::DoubleEspresso, $sub->getActivePlan());
    }

    public function testGetActivePlanFallsBackToFreeWhenCanceled(): void
    {
        $sub = $this->subscription(SubscriptionStatusEnum::Canceled, PlanEnum::Espresso);

        $this->assertSame(PlanEnum::Free, $sub->getActivePlan());
    }

    public function testIsEspressoTrueOnlyForActivePaidPlans(): void
    {
        $this->assertTrue($this->subscription(SubscriptionStatusEnum::Active, PlanEnum::Espresso)->isEspresso());
        $this->assertTrue($this->subscription(SubscriptionStatusEnum::Active, PlanEnum::DoubleEspresso)->isEspresso());
        $this->assertTrue($this->subscription(SubscriptionStatusEnum::Trialing, PlanEnum::Espresso)->isEspresso());

        $this->assertFalse($this->subscription(SubscriptionStatusEnum::Canceled, PlanEnum::Espresso)->isEspresso());
        $this->assertFalse($this->subscription(SubscriptionStatusEnum::Active, PlanEnum::Free)->isEspresso());
    }

    public function testGetTrialDaysRemainingNullWhenNotTrialing(): void
    {
        $sub = $this->subscription(SubscriptionStatusEnum::Active);
        $sub->setTrialEndsAt(new DateTimeImmutable('+5 days'));

        $this->assertNull($sub->getTrialDaysRemaining());
    }

    public function testGetTrialDaysRemainingNullWhenTrialEndsAtMissing(): void
    {
        $sub = $this->subscription(SubscriptionStatusEnum::Trialing);

        $this->assertNull($sub->getTrialDaysRemaining());
    }

    public function testGetTrialDaysRemainingReturnsZeroWhenTrialAlreadyExpired(): void
    {
        $sub = $this->subscription(SubscriptionStatusEnum::Trialing);
        $sub->setTrialEndsAt(new DateTimeImmutable('-1 day'));

        $this->assertSame(0, $sub->getTrialDaysRemaining());
    }

    public function testGetTrialDaysRemainingReturnsDayCountWhenTrialActive(): void
    {
        $sub = $this->subscription(SubscriptionStatusEnum::Trialing);
        // +3d10h still rounds to 3 full days; service adds +1 to make it inclusive.
        $sub->setTrialEndsAt(new DateTimeImmutable('+3 days +10 hours'));

        $days = $sub->getTrialDaysRemaining();

        $this->assertNotNull($days);
        $this->assertGreaterThanOrEqual(3, $days);
        $this->assertLessThanOrEqual(5, $days);
    }

    private function subscription(
        SubscriptionStatusEnum $status,
        PlanEnum $plan = PlanEnum::Free,
    ): Subscription {
        $sub = new Subscription();
        $sub->setStatus($status);
        $sub->setPlan($plan);
        return $sub;
    }
}

<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Subscription;
use App\Entity\Workspace;
use App\Enum\PlanEnum;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\EmployeeRepository;
use App\Repository\SubscriptionRepository;
use App\Service\PlanService;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;

class PlanServiceTest extends TestCase
{
    private SubscriptionRepository&Stub $subscriptionRepository;
    private EmployeeRepository&Stub $employeeRepository;
    private PlanService $planService;
    private Workspace&Stub $workspace;

    protected function setUp(): void
    {
        $this->subscriptionRepository = $this->createStub(SubscriptionRepository::class);
        $this->employeeRepository = $this->createStub(EmployeeRepository::class);
        $this->planService = new PlanService($this->subscriptionRepository, $this->employeeRepository);
        $this->workspace = $this->createStub(Workspace::class);
    }

    public function testGetPlanReturnsFreeWhenNoSubscription(): void
    {
        $this->subscriptionRepository->method('findByWorkspace')->willReturn(null);

        $this->assertSame(PlanEnum::Free, $this->planService->getPlan($this->workspace));
    }

    public function testGetPlanReturnsActivePlan(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::Espresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);

        $this->assertSame(PlanEnum::Espresso, $this->planService->getPlan($this->workspace));
    }

    public function testIsAtLeastEspressoWithFreePlan(): void
    {
        $this->subscriptionRepository->method('findByWorkspace')->willReturn(null);

        $this->assertFalse($this->planService->isAtLeastEspresso($this->workspace));
    }

    public function testIsAtLeastEspressoWithEspressoPlan(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::Espresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);

        $this->assertTrue($this->planService->isAtLeastEspresso($this->workspace));
    }

    public function testIsAtLeastEspressoWithDoubleEspressoPlan(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::DoubleEspresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);

        $this->assertTrue($this->planService->isAtLeastEspresso($this->workspace));
    }

    public function testIsDoubleEspresso(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::DoubleEspresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);

        $this->assertTrue($this->planService->isDoubleEspresso($this->workspace));
    }

    public function testCanAddEmployeeOnFreePlanUnderLimit(): void
    {
        $this->subscriptionRepository->method('findByWorkspace')->willReturn(null);
        $this->employeeRepository->method('countActiveByWorkspace')->willReturn(5);

        $this->assertTrue($this->planService->canAddEmployee($this->workspace));
    }

    public function testCanAddEmployeeOnFreePlanAtLimit(): void
    {
        $this->subscriptionRepository->method('findByWorkspace')->willReturn(null);
        $this->employeeRepository->method('countActiveByWorkspace')->willReturn(10);

        $this->assertFalse($this->planService->canAddEmployee($this->workspace));
    }

    public function testCanAddEmployeeOnEspressoPlanUnderLimit(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::Espresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);
        $this->employeeRepository->method('countActiveByWorkspace')->willReturn(15);

        $this->assertTrue($this->planService->canAddEmployee($this->workspace));
    }

    public function testCanAddEmployeeOnEspressoPlanAtLimit(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::Espresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);
        $this->employeeRepository->method('countActiveByWorkspace')->willReturn(20);

        $this->assertFalse($this->planService->canAddEmployee($this->workspace));
    }

    public function testCanAddEmployeeOnDoubleEspressoAlwaysTrue(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::DoubleEspresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);
        $this->employeeRepository->method('countActiveByWorkspace')->willReturn(999);

        $this->assertTrue($this->planService->canAddEmployee($this->workspace));
    }

    public function testManagerLimitByPlan(): void
    {
        // Free
        $this->subscriptionRepository->method('findByWorkspace')->willReturn(null);
        $this->assertSame(0, $this->planService->getManagerLimit($this->workspace));
    }

    public function testManagerLimitEspresso(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::Espresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);

        $this->assertSame(2, $this->planService->getManagerLimit($this->workspace));
    }

    public function testManagerLimitDoubleEspressoUnlimited(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::DoubleEspresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);

        $this->assertNull($this->planService->getManagerLimit($this->workspace));
    }

    public function testEmployeeLimitByPlan(): void
    {
        $this->subscriptionRepository->method('findByWorkspace')->willReturn(null);

        $this->assertSame(10, $this->planService->getEmployeeLimit($this->workspace));
    }

    public function testEmployeeLimitDoubleEspressoUnlimited(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::DoubleEspresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);

        $this->assertNull($this->planService->getEmployeeLimit($this->workspace));
    }

    public function testFeatureGatingOnFreePlan(): void
    {
        $this->subscriptionRepository->method('findByWorkspace')->willReturn(null);

        $this->assertFalse($this->planService->canUseIpRestriction($this->workspace));
        $this->assertFalse($this->planService->canUseGeofencing($this->workspace));
        $this->assertFalse($this->planService->canUseLeaveRequests($this->workspace));
        $this->assertFalse($this->planService->canUseShiftTimeRules($this->workspace));
        $this->assertFalse($this->planService->canUseDeviceVerification($this->workspace));
        $this->assertFalse($this->planService->canUseManagers($this->workspace));
        $this->assertFalse($this->planService->canUseTelegramNotifications($this->workspace));
    }

    public function testFeatureGatingOnEspressoPlan(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::Espresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);

        $this->assertTrue($this->planService->canUseIpRestriction($this->workspace));
        $this->assertTrue($this->planService->canUseGeofencing($this->workspace));
        $this->assertTrue($this->planService->canUseLeaveRequests($this->workspace));
        $this->assertTrue($this->planService->canUseShiftTimeRules($this->workspace));
        $this->assertTrue($this->planService->canUseDeviceVerification($this->workspace));
        $this->assertTrue($this->planService->canUseManagers($this->workspace));
        $this->assertTrue($this->planService->canUseTelegramNotifications($this->workspace));
    }

    public function testCanPromoteToManagerOnFreePlan(): void
    {
        $this->subscriptionRepository->method('findByWorkspace')->willReturn(null);

        $this->assertFalse($this->planService->canPromoteToManager($this->workspace));
    }

    public function testCanPromoteToManagerOnEspressoUnderLimit(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::Espresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);
        $this->employeeRepository->method('countManagersByWorkspace')->willReturn(1);

        $this->assertTrue($this->planService->canPromoteToManager($this->workspace));
    }

    public function testCanPromoteToManagerOnEspressoAtLimit(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::Espresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);
        $this->employeeRepository->method('countManagersByWorkspace')->willReturn(2);

        $this->assertFalse($this->planService->canPromoteToManager($this->workspace));
    }

    public function testCanPromoteToManagerOnDoubleEspressoAlwaysTrue(): void
    {
        $subscription = $this->createConfiguredStub(Subscription::class, [
            'getActivePlan' => PlanEnum::DoubleEspresso,
        ]);
        $this->subscriptionRepository->method('findByWorkspace')->willReturn($subscription);

        $this->assertTrue($this->planService->canPromoteToManager($this->workspace));
    }
}

<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Workspace;
use App\Enum\PlanEnum;
use App\Repository\EmployeeRepository;
use App\Repository\SubscriptionRepository;

class PlanService
{
    public const FREE_EMPLOYEE_LIMIT = 5;

    public function __construct(
        private SubscriptionRepository $subscriptionRepository,
        private EmployeeRepository $employeeRepository,
    ) {}

    public function getPlan(Workspace $workspace): PlanEnum
    {
        $subscription = $this->subscriptionRepository->findByWorkspace($workspace);
        if ($subscription === null) {
            return PlanEnum::Free;
        }

        return $subscription->isEspresso() ? PlanEnum::Espresso : PlanEnum::Free;
    }

    public function isEspresso(Workspace $workspace): bool
    {
        return $this->getPlan($workspace) === PlanEnum::Espresso;
    }

    public function canAddEmployee(Workspace $workspace): bool
    {
        if ($this->isEspresso($workspace)) {
            return true;
        }

        $count = $this->employeeRepository->countActiveByWorkspace($workspace);
        return $count < self::FREE_EMPLOYEE_LIMIT;
    }

    public function canUseIpRestriction(Workspace $workspace): bool
    {
        return $this->isEspresso($workspace);
    }

    public function canUseGeofencing(Workspace $workspace): bool
    {
        return $this->isEspresso($workspace);
    }

    public function canUseLeaveRequests(Workspace $workspace): bool
    {
        return $this->isEspresso($workspace);
    }

    public function canUseShiftTimeRules(Workspace $workspace): bool
    {
        return $this->isEspresso($workspace);
    }

    public function getRemainingEmployeeSlots(Workspace $workspace): ?int
    {
        if ($this->isEspresso($workspace)) {
            return null;
        }

        $count = $this->employeeRepository->countActiveByWorkspace($workspace);
        return max(0, self::FREE_EMPLOYEE_LIMIT - $count);
    }

    public function getPlanDetails(Workspace $workspace): array
    {
        $subscription = $this->subscriptionRepository->findByWorkspace($workspace);
        $plan = $this->getPlan($workspace);

        return [
            'plan' => $plan->value,
            'planLabel' => $plan->label(),
            'isEspresso' => $plan === PlanEnum::Espresso,
            'employeeLimit' => $plan === PlanEnum::Free ? self::FREE_EMPLOYEE_LIMIT : null,
            'remainingEmployeeSlots' => $this->getRemainingEmployeeSlots($workspace),
            'canUseIpRestriction' => $this->canUseIpRestriction($workspace),
            'canUseGeofencing' => $this->canUseGeofencing($workspace),
            'canUseLeaveRequests' => $this->canUseLeaveRequests($workspace),
            'canUseShiftTimeRules' => $this->canUseShiftTimeRules($workspace),
            'currentPeriodEnd' => $subscription?->getCurrentPeriodEnd()?->format('c'),
            'status' => $subscription?->getStatus()->value ?? 'active',
            'paddleSubscriptionId' => $subscription?->getPaddleSubscriptionId(),
        ];
    }
}

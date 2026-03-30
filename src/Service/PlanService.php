<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Workspace;
use App\Enum\PlanEnum;
use App\Repository\EmployeeRepository;
use App\Repository\SubscriptionRepository;

class PlanService
{
    public const FREE_EMPLOYEE_LIMIT = 10;
    public const ESPRESSO_EMPLOYEE_LIMIT = 20;

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

        return $subscription->getActivePlan();
    }

    public function isAtLeastEspresso(Workspace $workspace): bool
    {
        $plan = $this->getPlan($workspace);
        return in_array($plan, [PlanEnum::Espresso, PlanEnum::DoubleEspresso], true);
    }

    public function isDoubleEspresso(Workspace $workspace): bool
    {
        return $this->getPlan($workspace) === PlanEnum::DoubleEspresso;
    }

    public function canAddEmployee(Workspace $workspace): bool
    {
        $plan = $this->getPlan($workspace);
        if ($plan === PlanEnum::DoubleEspresso) {
            return true; // unlimited
        }

        $count = $this->employeeRepository->countActiveByWorkspace($workspace);
        $limit = $plan === PlanEnum::Espresso ? self::ESPRESSO_EMPLOYEE_LIMIT : self::FREE_EMPLOYEE_LIMIT;
        return $count < $limit;
    }

    public function canUseIpRestriction(Workspace $workspace): bool
    {
        return $this->isAtLeastEspresso($workspace);
    }

    public function canUseGeofencing(Workspace $workspace): bool
    {
        return $this->isAtLeastEspresso($workspace);
    }

    public function canUseLeaveRequests(Workspace $workspace): bool
    {
        return $this->isAtLeastEspresso($workspace);
    }

    public function canUseShiftTimeRules(Workspace $workspace): bool
    {
        return $this->isAtLeastEspresso($workspace);
    }

    public function canUseDeviceVerification(Workspace $workspace): bool
    {
        return $this->isAtLeastEspresso($workspace);
    }

    public function getEmployeeLimit(Workspace $workspace): ?int
    {
        $plan = $this->getPlan($workspace);
        return match ($plan) {
            PlanEnum::Free => self::FREE_EMPLOYEE_LIMIT,
            PlanEnum::Espresso => self::ESPRESSO_EMPLOYEE_LIMIT,
            PlanEnum::DoubleEspresso => null, // unlimited
        };
    }

    public function getRemainingEmployeeSlots(Workspace $workspace): ?int
    {
        $limit = $this->getEmployeeLimit($workspace);
        if ($limit === null) {
            return null; // unlimited
        }

        $count = $this->employeeRepository->countActiveByWorkspace($workspace);
        return max(0, $limit - $count);
    }

    public function getPlanDetails(Workspace $workspace): array
    {
        $subscription = $this->subscriptionRepository->findByWorkspace($workspace);
        $plan = $this->getPlan($workspace);

        $isTrialing = $subscription?->isTrialing() ?? false;
        $trialDaysRemaining = $subscription?->getTrialDaysRemaining();

        return [
            'plan' => $plan->value,
            'planLabel' => $isTrialing ? $plan->label() . ' (Trial)' : $plan->label(),
            'isEspresso' => $this->isAtLeastEspresso($workspace),
            'isDoubleEspresso' => $this->isDoubleEspresso($workspace),
            'isTrialing' => $isTrialing,
            'trialDaysRemaining' => $trialDaysRemaining,
            'trialEndsAt' => $subscription?->getTrialEndsAt()?->format('c'),
            'employeeLimit' => $this->getEmployeeLimit($workspace),
            'remainingEmployeeSlots' => $this->getRemainingEmployeeSlots($workspace),
            'canUseIpRestriction' => $this->canUseIpRestriction($workspace),
            'canUseGeofencing' => $this->canUseGeofencing($workspace),
            'canUseLeaveRequests' => $this->canUseLeaveRequests($workspace),
            'canUseShiftTimeRules' => $this->canUseShiftTimeRules($workspace),
            'canUseDeviceVerification' => $this->canUseDeviceVerification($workspace),
            'currentPeriodEnd' => $subscription?->getCurrentPeriodEnd()?->format('c'),
            'status' => $subscription?->getStatus()->value ?? 'active',
            'source' => $subscription?->getSource()?->value ?? null,
            'paddleSubscriptionId' => $subscription?->getPaddleSubscriptionId(),
        ];
    }
}

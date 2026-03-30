<?php

declare(strict_types=1);

namespace App\ApiController\Dev;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\Subscription;
use App\Entity\User;
use App\Enum\PlanEnum;
use App\Enum\SubscriptionSourceEnum;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\SubscriptionRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/**
 * Dev-only endpoints for testing. Only available in dev environment.
 */
#[Route('/dev')]
class DevController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/toggle-plan', name: 'dev_toggle_plan', methods: ['POST'])]
    public function togglePlan(
        #[CurrentUser] User $user,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        SubscriptionRepository $subscriptionRepository,
    ): JsonResponse {
        if ($this->getParameter('kernel.environment') !== 'dev') {
            return $this->jsonError('Only available in dev environment', 403);
        }

        $data = json_decode($request->getContent(), true);
        $workspacePublicId = $data['workspacePublicId'] ?? null;
        $targetPlan = $data['plan'] ?? null; // 'free', 'espresso', 'double_espresso'

        if (!$workspacePublicId || !$targetPlan) {
            return $this->jsonError('workspacePublicId and plan are required');
        }

        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $subscription = $subscriptionRepository->findByWorkspace($workspace);

        if ($targetPlan === 'free') {
            if ($subscription !== null) {
                $subscription->setStatus(SubscriptionStatusEnum::Canceled);
                $subscriptionRepository->flush();
            }
            return $this->jsonSuccess(['plan' => 'free', 'message' => 'Downgraded to Free']);
        }

        $plan = $targetPlan === 'double_espresso' ? PlanEnum::DoubleEspresso : PlanEnum::Espresso;

        if ($subscription === null) {
            $subscription = new Subscription();
            $subscription->setWorkspace($workspace);
            $subscriptionRepository->persist($subscription);
        }

        $subscription->setPlan($plan);
        $subscription->setSource(SubscriptionSourceEnum::Paddle);
        $subscription->setStatus(SubscriptionStatusEnum::Active);
        $subscription->setCurrentPeriodEnd(new \DateTimeImmutable('+30 days'));
        $subscription->setTrialEndsAt(null);
        $subscription->setCanceledAt(null);

        $subscriptionRepository->flush();

        return $this->jsonSuccess([
            'plan' => $plan->value,
            'message' => 'Upgraded to ' . $plan->label(),
        ]);
    }
}

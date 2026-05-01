<?php

declare(strict_types=1);

namespace App\ApiController\Admin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\Subscription;
use App\Repository\SubscriptionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/subscriptions')]
class AdminSubscriptionController extends AbstractController
{
    use ApiResponseTrait;

    private const int PAGE_SIZE = 25;

    #[Route('', name: 'admin_subscriptions_list', methods: ['GET'])]
    public function list(
        Request $request,
        SubscriptionRepository $subscriptionRepository,
    ): JsonResponse {
        $page = max(1, (int) $request->query->get('page', '1'));
        $status = trim((string) $request->query->get('status', ''));
        $plan = trim((string) $request->query->get('plan', ''));

        $qb = $subscriptionRepository->createQueryBuilder('s')
            ->leftJoin('s.workspace', 'w')->addSelect('w')
            ->leftJoin('w.owner', 'o')->addSelect('o')
            ->orderBy('s.createdAt', 'DESC');

        if ($status !== '') {
            $qb->andWhere('s.status = :status')->setParameter('status', $status);
        }
        if ($plan !== '') {
            $qb->andWhere('s.plan = :plan')->setParameter('plan', $plan);
        }

        $total = (clone $qb)->select('COUNT(s.id)')->resetDQLPart('orderBy')->getQuery()->getSingleScalarResult();

        /** @var Subscription[] $subs */
        $subs = $qb
            ->setFirstResult(($page - 1) * self::PAGE_SIZE)
            ->setMaxResults(self::PAGE_SIZE)
            ->getQuery()
            ->getResult();

        $items = array_map(fn (Subscription $s) => [
            'publicId' => (string) $s->getPublicId(),
            'plan' => $s->getPlan()->value,
            'status' => $s->getStatus()->value,
            'isActive' => $s->isActive(),
            'isTrialing' => $s->isTrialing(),
            'trialDaysRemaining' => $s->getTrialDaysRemaining(),
            'currentPeriodEnd' => $s->getCurrentPeriodEnd()?->format('c'),
            'trialEndsAt' => $s->getTrialEndsAt()?->format('c'),
            'canceledAt' => $s->getCanceledAt()?->format('c'),
            'paddleSubscriptionId' => $s->getPaddleSubscriptionId(),
            'workspace' => [
                'publicId' => (string) $s->getWorkspace()->getPublicId(),
                'name' => $s->getWorkspace()->getName(),
            ],
            'owner' => $s->getWorkspace()->getOwner() ? [
                'publicId' => (string) $s->getWorkspace()->getOwner()->getPublicId(),
                'email' => $s->getWorkspace()->getOwner()->getEmail(),
            ] : null,
            'createdAt' => $s->getCreatedAt()->format('c'),
        ], $subs);

        return $this->jsonSuccess([
            'items' => $items,
            'page' => $page,
            'pageSize' => self::PAGE_SIZE,
            'total' => (int) $total,
        ]);
    }
}

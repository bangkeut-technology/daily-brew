<?php

declare(strict_types=1);

namespace App\ApiController\Admin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\AdminAuditActionEnum;
use App\Repository\EmployeeRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\WorkspaceQrCodeRepository;
use App\Repository\WorkspaceRepository;
use App\Service\AdminAuditService;
use App\Service\WorkspaceService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/admin/workspaces')]
class AdminWorkspaceController extends AbstractController
{
    use ApiResponseTrait;

    private const int PAGE_SIZE = 25;

    #[Route('', name: 'admin_workspaces_list', methods: ['GET'])]
    public function list(
        Request $request,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        SubscriptionRepository $subscriptionRepository,
    ): JsonResponse {
        $page = max(1, (int) $request->query->get('page', '1'));
        $search = trim((string) $request->query->get('search', ''));
        $plan = trim((string) $request->query->get('plan', ''));
        $includeDeleted = $request->query->getBoolean('includeDeleted');

        $qb = $workspaceRepository->createQueryBuilder('w')
            ->leftJoin('w.owner', 'o')->addSelect('o')
            ->leftJoin(\App\Entity\Subscription::class, 's', 'WITH', 's.workspace = w')->addSelect('s')
            ->orderBy('w.createdAt', 'DESC');

        if (!$includeDeleted) {
            $qb->andWhere('w.deletedAt IS NULL');
        }

        if ($search !== '') {
            $qb->andWhere('LOWER(w.name) LIKE :q OR LOWER(o.email) LIKE :q')
               ->setParameter('q', '%' . mb_strtolower($search) . '%');
        }

        if ($plan !== '') {
            // "free" matches workspaces with no subscription OR a subscription on the free plan.
            if ($plan === 'free') {
                $qb->andWhere('s IS NULL OR s.plan = :plan')->setParameter('plan', 'free');
            } else {
                $qb->andWhere('s.plan = :plan')->setParameter('plan', $plan);
            }
        }

        $total = (clone $qb)
            ->select('COUNT(DISTINCT w.id)')
            ->resetDQLPart('orderBy')
            ->getQuery()
            ->getSingleScalarResult();

        /** @var Workspace[] $workspaces */
        $workspaces = $qb
            ->setFirstResult(($page - 1) * self::PAGE_SIZE)
            ->setMaxResults(self::PAGE_SIZE)
            ->getQuery()
            ->getResult();

        // Batch-fetch subscriptions + employee counts to avoid N+1 (one query each, not 25).
        [$subsByWorkspaceId, $employeeCountByWorkspaceId] = $this->batchLoad(
            $workspaces,
            $subscriptionRepository,
            $employeeRepository,
        );

        $rows = array_map(function (Workspace $w) use ($subsByWorkspaceId, $employeeCountByWorkspaceId) {
            $sub = $subsByWorkspaceId[$w->getId()] ?? null;
            $rowPlan = $sub?->getPlan()->value ?? 'free';
            return [
                'publicId' => (string) $w->getPublicId(),
                'name' => $w->getName(),
                'owner' => $w->getOwner() ? [
                    'publicId' => (string) $w->getOwner()->getPublicId(),
                    'email' => $w->getOwner()->getEmail(),
                    'fullName' => $w->getOwner()->getFullName(),
                ] : null,
                'plan' => $rowPlan,
                'subscriptionStatus' => $sub?->getStatus()->value,
                'currentPeriodEnd' => $sub?->getCurrentPeriodEnd()?->format('c'),
                'isTrialing' => $sub?->isTrialing() ?? false,
                'employeeCount' => $employeeCountByWorkspaceId[$w->getId()] ?? 0,
                'createdAt' => $w->getCreatedAt()->format('c'),
                'deletedAt' => $w->getDeletedAt()?->format('c'),
            ];
        }, $workspaces);

        return $this->jsonSuccess([
            'items' => $rows,
            'page' => $page,
            'pageSize' => self::PAGE_SIZE,
            'total' => (int) $total,
        ]);
    }

    /**
     * @param Workspace[] $workspaces
     * @return array{0: array<int, \App\Entity\Subscription>, 1: array<int, int>}
     */
    private function batchLoad(
        array $workspaces,
        SubscriptionRepository $subscriptionRepository,
        EmployeeRepository $employeeRepository,
    ): array {
        if (empty($workspaces)) {
            return [[], []];
        }
        $ids = array_map(fn (Workspace $w) => $w->getId(), $workspaces);

        $subs = $subscriptionRepository->createQueryBuilder('s')
            ->where('IDENTITY(s.workspace) IN (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->getResult();

        $subsByWorkspaceId = [];
        foreach ($subs as $sub) {
            $subsByWorkspaceId[$sub->getWorkspace()->getId()] = $sub;
        }

        /** @var array<int, array{wid: int, c: int}> $countRows */
        $countRows = $employeeRepository->createQueryBuilder('e')
            ->select('IDENTITY(e.workspace) as wid, COUNT(e.id) as c')
            ->where('IDENTITY(e.workspace) IN (:ids)')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('ids', $ids)
            ->groupBy('e.workspace')
            ->getQuery()
            ->getArrayResult();

        $employeeCountByWorkspaceId = [];
        foreach ($countRows as $row) {
            $employeeCountByWorkspaceId[(int) $row['wid']] = (int) $row['c'];
        }

        return [$subsByWorkspaceId, $employeeCountByWorkspaceId];
    }

    #[Route('/{publicId}/cancel-subscription', name: 'admin_workspaces_cancel_subscription', methods: ['POST'])]
    public function cancelSubscription(
        string $publicId,
        WorkspaceRepository $workspaceRepository,
        SubscriptionRepository $subscriptionRepository,
        WorkspaceService $workspaceService,
        AdminAuditService $auditService,
        #[CurrentUser] User $currentUser,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($publicId);
        if (!$workspace instanceof Workspace) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $subscription = $subscriptionRepository->findByWorkspace($workspace);
        if ($subscription === null) {
            return $this->jsonError('Workspace has no subscription to cancel', 409);
        }

        $previousPlan = $subscription->getPlan()->value;
        $workspaceService->forceCancelSubscription($subscription);

        $auditService->record(
            actor: $currentUser,
            action: AdminAuditActionEnum::CancelSubscription,
            targetType: 'workspace',
            targetPublicId: (string) $workspace->getPublicId(),
            targetLabel: $workspace->getName(),
            metadata: ['previousPlan' => $previousPlan, 'paddleSubscriptionId' => $subscription->getPaddleSubscriptionId()],
        );

        return $this->jsonSuccess([
            'status' => $subscription->getStatus()->value,
            'canceledAt' => $subscription->getCanceledAt()?->format('c'),
        ]);
    }

    #[Route('/{publicId}/restore', name: 'admin_workspaces_restore', methods: ['POST'])]
    public function restore(
        string $publicId,
        WorkspaceRepository $workspaceRepository,
        AdminAuditService $auditService,
        #[CurrentUser] User $currentUser,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($publicId);
        if (!$workspace instanceof Workspace) {
            throw new NotFoundHttpException('Workspace not found');
        }

        if ($workspace->getDeletedAt() === null) {
            return $this->jsonError('Workspace is not deleted', 409);
        }

        $workspace->setDeletedAt(null);

        // Un-soft-delete all employees in this workspace so the restored workspace
        // is functional. Employee→User links severed at delete time stay severed —
        // owner must re-link manually.
        $restoredEmployees = 0;
        foreach ($workspace->getEmployees() as $employee) {
            if ($employee->getDeletedAt() !== null) {
                $employee->setDeletedAt(null);
                $restoredEmployees++;
            }
        }

        $workspaceRepository->flush();

        $auditService->record(
            actor: $currentUser,
            action: AdminAuditActionEnum::RestoreWorkspace,
            targetType: 'workspace',
            targetPublicId: (string) $workspace->getPublicId(),
            targetLabel: $workspace->getName(),
            metadata: ['restoredEmployees' => $restoredEmployees],
        );

        return $this->jsonSuccess([
            'publicId' => (string) $workspace->getPublicId(),
            'deletedAt' => null,
            'restoredEmployees' => $restoredEmployees,
        ]);
    }

    #[Route('/{publicId}', name: 'admin_workspaces_show', methods: ['GET'])]
    public function show(
        string $publicId,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        SubscriptionRepository $subscriptionRepository,
        WorkspaceQrCodeRepository $qrCodeRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($publicId);
        if (!$workspace instanceof Workspace) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $sub = $subscriptionRepository->findByWorkspace($workspace);
        $employeeCount = $employeeRepository->count(['workspace' => $workspace, 'deletedAt' => null]);
        $qrCount = $qrCodeRepository->count(['workspace' => $workspace]);

        return $this->jsonSuccess([
            'publicId' => (string) $workspace->getPublicId(),
            'name' => $workspace->getName(),
            'qrToken' => $workspace->getQrToken(),
            'createdAt' => $workspace->getCreatedAt()->format('c'),
            'updatedAt' => $workspace->getUpdatedAt()->format('c'),
            'deletedAt' => $workspace->getDeletedAt()?->format('c'),
            'owner' => $workspace->getOwner() ? [
                'publicId' => (string) $workspace->getOwner()->getPublicId(),
                'email' => $workspace->getOwner()->getEmail(),
                'fullName' => $workspace->getOwner()->getFullName(),
            ] : null,
            'employeeCount' => $employeeCount,
            'qrCodeCount' => $qrCount,
            'subscription' => $sub ? [
                'plan' => $sub->getPlan()->value,
                'status' => $sub->getStatus()->value,
                'paddleSubscriptionId' => $sub->getPaddleSubscriptionId(),
                'paddleCustomerId' => $sub->getPaddleCustomerId(),
                'currentPeriodEnd' => $sub->getCurrentPeriodEnd()?->format('c'),
                'trialEndsAt' => $sub->getTrialEndsAt()?->format('c'),
                'canceledAt' => $sub->getCanceledAt()?->format('c'),
                'isActive' => $sub->isActive(),
            ] : null,
            'settings' => $workspace->getSetting() ? [
                'timezone' => $workspace->getSetting()->getTimezone(),
                'ipRestrictionEnabled' => $workspace->getSetting()->isIpRestrictionEnabled(),
                'geofencingEnabled' => $workspace->getSetting()->isGeofencingEnabled(),
                'deviceVerificationEnabled' => $workspace->getSetting()->isDeviceVerificationEnabled(),
            ] : null,
        ]);
    }
}

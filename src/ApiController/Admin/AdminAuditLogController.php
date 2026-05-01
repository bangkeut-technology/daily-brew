<?php

declare(strict_types=1);

namespace App\ApiController\Admin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\AdminAuditLog;
use App\Repository\AdminAuditLogRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/audit-log')]
class AdminAuditLogController extends AbstractController
{
    use ApiResponseTrait;

    private const int PAGE_SIZE = 50;

    #[Route('', name: 'admin_audit_log_list', methods: ['GET'])]
    public function list(
        Request $request,
        AdminAuditLogRepository $auditRepository,
    ): JsonResponse {
        $page = max(1, (int) $request->query->get('page', '1'));
        $action = trim((string) $request->query->get('action', ''));
        $targetType = trim((string) $request->query->get('targetType', ''));

        $qb = $auditRepository->createQueryBuilder('a')
            ->leftJoin('a.actor', 'u')->addSelect('u')
            ->orderBy('a.createdAt', 'DESC');

        if ($action !== '') {
            $qb->andWhere('a.action = :action')->setParameter('action', $action);
        }
        if ($targetType !== '') {
            $qb->andWhere('a.targetType = :tt')->setParameter('tt', $targetType);
        }

        $total = (clone $qb)->select('COUNT(a.id)')->resetDQLPart('orderBy')->getQuery()->getSingleScalarResult();

        /** @var AdminAuditLog[] $logs */
        $logs = $qb
            ->setFirstResult(($page - 1) * self::PAGE_SIZE)
            ->setMaxResults(self::PAGE_SIZE)
            ->getQuery()
            ->getResult();

        $items = array_map(fn (AdminAuditLog $log) => [
            'publicId' => (string) $log->getPublicId(),
            'action' => $log->getAction()->value,
            'actionLabel' => $log->getAction()->label(),
            'actor' => $log->getActor() ? [
                'publicId' => (string) $log->getActor()->getPublicId(),
                'email' => $log->getActor()->getEmail(),
            ] : null,
            'actorEmail' => $log->getActorEmail(),
            'targetType' => $log->getTargetType(),
            'targetPublicId' => $log->getTargetPublicId(),
            'targetLabel' => $log->getTargetLabel(),
            'metadata' => $log->getMetadata(),
            'createdAt' => $log->getCreatedAt()->format('c'),
        ], $logs);

        return $this->jsonSuccess([
            'items' => $items,
            'page' => $page,
            'pageSize' => self::PAGE_SIZE,
            'total' => (int) $total,
        ]);
    }
}

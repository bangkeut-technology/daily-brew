<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\AdminAuditLog;
use App\Entity\User;
use App\Enum\AdminAuditActionEnum;
use App\Repository\AdminAuditLogRepository;
use Psr\Log\LoggerInterface;
use Throwable;

/**
 * Records admin actions to an append-only audit log. Failures here MUST NOT
 * block the underlying admin action — exceptions are caught and logged so the
 * controller can still return success. A missing audit row is preferable to a
 * 500 that confuses the operator.
 */
class AdminAuditService
{
    public function __construct(
        private readonly AdminAuditLogRepository $auditRepository,
        private readonly LoggerInterface $logger,
    ) {}

    /**
     * @param array<string, mixed>|null $metadata
     */
    public function record(
        User $actor,
        AdminAuditActionEnum $action,
        string $targetType,
        ?string $targetPublicId,
        ?string $targetLabel = null,
        ?array $metadata = null,
    ): void {
        try {
            $log = new AdminAuditLog();
            $log->setActor($actor);
            $log->setActorEmail($actor->getEmail());
            $log->setAction($action);
            $log->setTargetType($targetType);
            $log->setTargetPublicId($targetPublicId);
            $log->setTargetLabel($targetLabel);
            $log->setMetadata($metadata);

            $this->auditRepository->persist($log);
            $this->auditRepository->flush();
        } catch (Throwable $e) {
            $this->logger->error('Admin audit record failed', [
                'exception' => $e,
                'action' => $action->value,
                'targetType' => $targetType,
                'targetPublicId' => $targetPublicId,
                'actorEmail' => $actor->getEmail(),
            ]);
        }
    }
}

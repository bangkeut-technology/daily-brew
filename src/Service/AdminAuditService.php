<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\AdminAuditLog;
use App\Entity\User;
use App\Enum\AdminAuditActionEnum;
use App\Enum\AdminAuditTargetTypeEnum;
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
     * Record an admin action initiated by a logged-in user (web UI).
     *
     * @param array<string, mixed>|null $metadata
     */
    public function record(
        User $actor,
        AdminAuditActionEnum $action,
        AdminAuditTargetTypeEnum $targetType,
        ?string $targetPublicId,
        ?string $targetLabel = null,
        ?array $metadata = null,
    ): void {
        $this->writeLog($actor, $actor->getEmail(), $action, $targetType, $targetPublicId, $targetLabel, $metadata);
    }

    /**
     * Record an admin action initiated outside the web UI (CLI commands,
     * automated jobs). $actorLabel is stored in the actorEmail column so the
     * audit log row reads e.g. "cli:dailybrew:admin:promote-user".
     *
     * @param array<string, mixed>|null $metadata
     */
    public function recordSystem(
        string $actorLabel,
        AdminAuditActionEnum $action,
        AdminAuditTargetTypeEnum $targetType,
        ?string $targetPublicId,
        ?string $targetLabel = null,
        ?array $metadata = null,
    ): void {
        $this->writeLog(null, $actorLabel, $action, $targetType, $targetPublicId, $targetLabel, $metadata);
    }

    /**
     * @param array<string, mixed>|null $metadata
     */
    private function writeLog(
        ?User $actor,
        ?string $actorEmail,
        AdminAuditActionEnum $action,
        AdminAuditTargetTypeEnum $targetType,
        ?string $targetPublicId,
        ?string $targetLabel,
        ?array $metadata,
    ): void {
        try {
            $log = new AdminAuditLog();
            $log->setActor($actor);
            $log->setActorEmail($actorEmail);
            $log->setAction($action);
            $log->setTargetType($targetType->value);
            $log->setTargetPublicId($targetPublicId);
            $log->setTargetLabel($targetLabel);
            $log->setMetadata($metadata);

            $this->auditRepository->persist($log);
            $this->auditRepository->flush();
        } catch (Throwable $e) {
            $this->logger->error('Admin audit record failed', [
                'exception' => $e,
                'action' => $action->value,
                'targetType' => $targetType->value,
                'targetPublicId' => $targetPublicId,
                'actorEmail' => $actorEmail,
            ]);
        }
    }
}

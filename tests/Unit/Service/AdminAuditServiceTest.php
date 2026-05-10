<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\AdminAuditLog;
use App\Entity\User;
use App\Enum\AdminAuditActionEnum;
use App\Enum\AdminAuditTargetTypeEnum;
use App\Repository\AdminAuditLogRepository;
use App\Service\AdminAuditService;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

#[AllowMockObjectsWithoutExpectations]
class AdminAuditServiceTest extends TestCase
{
    private AdminAuditLogRepository&MockObject $repo;
    private LoggerInterface&MockObject $logger;
    private AdminAuditService $svc;

    protected function setUp(): void
    {
        $this->repo = $this->createMock(AdminAuditLogRepository::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $this->svc = new AdminAuditService($this->repo, $this->logger);
    }

    public function testRecordPersistsLogWithActorEmailAndAllFields(): void
    {
        $actor = (new User())->setEmail('admin@dailybrew.work');
        $captured = null;
        $this->repo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (AdminAuditLog $log) use (&$captured): bool {
                $captured = $log;
                return true;
            }));
        $this->repo->expects($this->once())->method('flush');
        $this->logger->expects($this->never())->method('error');

        $this->svc->record(
            $actor,
            AdminAuditActionEnum::PromoteUser,
            AdminAuditTargetTypeEnum::User,
            'pub-123',
            'Vandeth Tho',
            ['note' => 'requested by Linear ADM-42'],
        );

        $this->assertSame($actor, $captured->getActor());
        $this->assertSame('admin@dailybrew.work', $captured->getActorEmail());
        $this->assertSame(AdminAuditActionEnum::PromoteUser, $captured->getAction());
        $this->assertSame(AdminAuditTargetTypeEnum::User->value, $captured->getTargetType());
        $this->assertSame('pub-123', $captured->getTargetPublicId());
        $this->assertSame('Vandeth Tho', $captured->getTargetLabel());
        $this->assertSame(['note' => 'requested by Linear ADM-42'], $captured->getMetadata());
    }

    public function testRecordSystemUsesProvidedLabelInsteadOfActor(): void
    {
        $captured = null;
        $this->repo->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (AdminAuditLog $log) use (&$captured): bool {
                $captured = $log;
                return true;
            }));
        $this->repo->expects($this->once())->method('flush');

        $this->svc->recordSystem(
            'cli:dailybrew:admin:promote-user',
            AdminAuditActionEnum::PromoteUser,
            AdminAuditTargetTypeEnum::User,
            'pub-456',
        );

        $this->assertNull($captured->getActor());
        $this->assertSame('cli:dailybrew:admin:promote-user', $captured->getActorEmail());
        $this->assertSame('pub-456', $captured->getTargetPublicId());
        $this->assertNull($captured->getTargetLabel());
        $this->assertNull($captured->getMetadata());
    }

    public function testRecordSwallowsRepositoryFailureAndLogsIt(): void
    {
        $boom = new \RuntimeException('database unreachable');
        $this->repo->method('persist')->willThrowException($boom);
        $this->logger->expects($this->once())
            ->method('error')
            ->with(
                'Admin audit record failed',
                $this->callback(fn (array $ctx) =>
                    $ctx['exception'] === $boom
                    && $ctx['action'] === 'promote_user'
                    && $ctx['actorEmail'] === 'admin@dailybrew.work'
                ),
            );

        // Must NOT throw — audit failure cannot block the underlying admin action.
        $this->svc->record(
            (new User())->setEmail('admin@dailybrew.work'),
            AdminAuditActionEnum::PromoteUser,
            AdminAuditTargetTypeEnum::User,
            'pub-123',
        );
    }

    public function testRecordSystemSwallowsFlushFailureAndLogsIt(): void
    {
        $this->repo->method('persist'); // succeeds
        $this->repo->method('flush')->willThrowException(new \RuntimeException('flush failed'));
        $this->logger->expects($this->once())
            ->method('error')
            ->with('Admin audit record failed', $this->arrayHasKey('exception'));

        $this->svc->recordSystem(
            'cli:test',
            AdminAuditActionEnum::CancelSubscription,
            AdminAuditTargetTypeEnum::Subscription,
            'sub-1',
        );
    }
}

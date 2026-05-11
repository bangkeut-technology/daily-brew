<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\AdminAuditLog;
use App\Entity\User;
use App\Enum\AdminAuditActionEnum;
use PHPUnit\Framework\TestCase;

class AdminAuditLogTest extends TestCase
{
    public function testFieldsRoundTrip(): void
    {
        $actor = (new User())->setEmail('admin@dailybrew.work');
        $log = (new AdminAuditLog())
            ->setActor($actor)
            ->setActorEmail('admin@dailybrew.work')
            ->setAction(AdminAuditActionEnum::PromoteUser)
            ->setTargetType('user')
            ->setTargetPublicId('pub-123')
            ->setTargetLabel('Vandeth Tho')
            ->setMetadata(['note' => 'requested by Linear ADM-42']);

        $this->assertSame($actor, $log->getActor());
        $this->assertSame('admin@dailybrew.work', $log->getActorEmail());
        $this->assertSame(AdminAuditActionEnum::PromoteUser, $log->getAction());
        $this->assertSame('user', $log->getTargetType());
        $this->assertSame('pub-123', $log->getTargetPublicId());
        $this->assertSame('Vandeth Tho', $log->getTargetLabel());
        $this->assertSame(['note' => 'requested by Linear ADM-42'], $log->getMetadata());
    }

    public function testActorIsNullableForSystemRecordedActions(): void
    {
        // CLI commands and automated jobs record without a User in the actor column;
        // the actorEmail column carries the label (e.g. "cli:dailybrew:admin:promote-user").
        $log = (new AdminAuditLog())
            ->setActor(null)
            ->setActorEmail('cli:dailybrew:admin:promote-user')
            ->setAction(AdminAuditActionEnum::PromoteUser)
            ->setTargetType('user');

        $this->assertNull($log->getActor());
        $this->assertSame('cli:dailybrew:admin:promote-user', $log->getActorEmail());
    }

    public function testMetadataAndTargetLabelAreNullableForMinimalAudit(): void
    {
        $log = (new AdminAuditLog())
            ->setAction(AdminAuditActionEnum::RestoreWorkspace)
            ->setTargetType('workspace');

        $this->assertNull($log->getMetadata());
        $this->assertNull($log->getTargetLabel());
        $this->assertNull($log->getTargetPublicId());
    }
}

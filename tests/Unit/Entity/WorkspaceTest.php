<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Employee;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use Doctrine\Common\Collections\Collection;
use PHPUnit\Framework\TestCase;

class WorkspaceTest extends TestCase
{
    public function testConstructorGeneratesAQrToken(): void
    {
        $ws = new Workspace();

        $this->assertNotEmpty($ws->getQrToken());
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9]+$/', $ws->getQrToken());
    }

    public function testEachInstanceGetsAUniqueQrToken(): void
    {
        $tokens = [];
        for ($i = 0; $i < 5; $i++) {
            $tokens[] = (new Workspace())->getQrToken();
        }

        $this->assertCount(5, array_unique($tokens), 'Each new workspace should have a unique QR token');
    }

    public function testCollectionsInitializeAsEmpty(): void
    {
        $ws = new Workspace();

        $this->assertInstanceOf(Collection::class, $ws->getEmployees());
        $this->assertCount(0, $ws->getEmployees());
    }

    public function testSettingSetterBackReferencesWorkspace(): void
    {
        $ws = new Workspace();
        $setting = new WorkspaceSetting();
        $ws->setSetting($setting);

        $this->assertSame($setting, $ws->getSetting());
        $this->assertSame($ws, $setting->getWorkspace(), 'setSetting should auto-link the back-reference');
    }

    public function testSettingBackReferenceNotChangedWhenAlreadyOwnsTheSetting(): void
    {
        $ws = new Workspace();
        $setting = new WorkspaceSetting();
        $setting->setWorkspace($ws);
        // Calling setSetting again should be idempotent and not re-trigger the back-link.
        $ws->setSetting($setting);

        $this->assertSame($ws, $setting->getWorkspace());
    }

    public function testSoftDeleteSetsDeletedAt(): void
    {
        $ws = new Workspace();

        $this->assertNull($ws->getDeletedAt());

        $now = new \DateTimeImmutable();
        $ws->setDeletedAt($now);

        $this->assertSame($now, $ws->getDeletedAt());
    }

    public function testOwnerCanBeUnsetAndRestored(): void
    {
        $owner = new User();
        $ws = new Workspace();
        $ws->setOwner($owner);
        $this->assertSame($owner, $ws->getOwner());

        $ws->setOwner(null);
        $this->assertNull($ws->getOwner());
    }
}

<?php

declare(strict_types=1);

namespace App\Tests\Unit\DTO;

use App\DTO\WorkspaceDTO;
use App\Entity\User;
use App\Entity\Workspace;
use PHPUnit\Framework\TestCase;

class WorkspaceDTOTest extends TestCase
{
    public function testFromEntityCopiesNameAndCreatedAt(): void
    {
        $ws = (new Workspace())->setName('Daily Grind');

        $dto = WorkspaceDTO::fromEntity($ws);

        $this->assertSame('Daily Grind', $dto->name);
        $this->assertNotEmpty($dto->publicId);
        $this->assertNotEmpty($dto->createdAt);
        $this->assertNull($dto->ownerPublicId, 'No owner attached yet → null');
    }

    public function testFromEntityExposesOwnerPublicIdWhenOwnerSet(): void
    {
        $owner = new User();
        $ws = (new Workspace())->setName('WS')->setOwner($owner);

        $dto = WorkspaceDTO::fromEntity($ws);

        $this->assertSame($owner->getPublicId(), $dto->ownerPublicId);
    }

    public function testToArrayMirrorsDtoFields(): void
    {
        $ws = (new Workspace())->setName('WS');

        $arr = WorkspaceDTO::fromEntity($ws)->toArray();

        $this->assertSame(['publicId', 'name', 'ownerPublicId', 'createdAt'], array_keys($arr));
    }
}

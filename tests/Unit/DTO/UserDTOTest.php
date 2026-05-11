<?php

declare(strict_types=1);

namespace App\Tests\Unit\DTO;

use App\DTO\UserDTO;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\UserRoleEnum;
use PHPUnit\Framework\TestCase;

class UserDTOTest extends TestCase
{
    public function testFromEntityCopiesProfileFieldsAndMarksSuperAdminFalseByDefault(): void
    {
        $user = $this->user()
            ->setEmail('owner@dailybrew.work')
            ->setFirstName('Vandeth')
            ->setLastName('Tho')
            ->setLocale('en');

        $dto = UserDTO::fromEntity($user);

        $this->assertSame('owner@dailybrew.work', $dto->email);
        $this->assertSame('Vandeth', $dto->firstName);
        $this->assertSame('Tho', $dto->lastName);
        $this->assertSame('Vandeth Tho', $dto->fullName);
        $this->assertSame('en', $dto->locale);
        $this->assertFalse($dto->isSuperAdmin);
        $this->assertNull($dto->currentWorkspacePublicId);
    }

    public function testFromEntityFlagsSuperAdminWhenRoleAttached(): void
    {
        $user = $this->user()->setSuperAdmin(true);

        $dto = UserDTO::fromEntity($user);

        $this->assertTrue($dto->isSuperAdmin);
    }

    public function testFromEntityExposesCurrentWorkspacePublicIdWhenSet(): void
    {
        $workspace = new Workspace();
        $user = $this->user();
        $user->setCurrentWorkspace($workspace);

        $dto = UserDTO::fromEntity($user);

        $this->assertSame($workspace->getPublicId(), $dto->currentWorkspacePublicId);
    }

    public function testToArrayPreservesEveryDTOField(): void
    {
        $user = $this->user()
            ->setEmail('owner@dailybrew.work')
            ->setFirstName('Vandeth')
            ->setLastName('Tho');

        $array = UserDTO::fromEntity($user)->toArray();

        $this->assertArrayHasKey('publicId', $array);
        $this->assertArrayHasKey('email', $array);
        $this->assertArrayHasKey('fullName', $array);
        $this->assertArrayHasKey('locale', $array);
        $this->assertArrayHasKey('onboardingCompleted', $array);
        $this->assertArrayHasKey('currentWorkspacePublicId', $array);
        $this->assertArrayHasKey('isSuperAdmin', $array);
        $this->assertSame('owner@dailybrew.work', $array['email']);
        $this->assertSame('Vandeth Tho', $array['fullName']);
        $this->assertFalse($array['isSuperAdmin']);
    }

    /**
     * User extends AbstractBaseEntity which generates publicId in the parent constructor —
     * so a `new User()` already has a valid UUID without any persistence.
     */
    private function user(): User
    {
        return new User();
    }
}

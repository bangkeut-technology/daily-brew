<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\User;
use App\Enum\UserRoleEnum;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function testGetUserIdentifierReturnsEmail(): void
    {
        $user = (new User())->setEmail('owner@dailybrew.work');

        $this->assertSame('owner@dailybrew.work', $user->getUserIdentifier());
    }

    public function testGetUserIdentifierReturnsEmptyStringWhenEmailMissing(): void
    {
        $user = new User();

        $this->assertSame('', $user->getUserIdentifier());
    }

    public function testHasPasswordIsFalseUntilSet(): void
    {
        $user = new User();

        $this->assertFalse($user->hasPassword());

        $user->setPassword('hashed');

        $this->assertTrue($user->hasPassword());
    }

    public function testGetRolesAlwaysIncludesRoleUser(): void
    {
        $user = new User();

        $this->assertContains(UserRoleEnum::DEFAULT->value, $user->getRoles());
    }

    public function testAddRoleUppercasesAndDeduplicates(): void
    {
        $user = new User();

        $user->addRole('role_admin');
        $user->addRole('ROLE_ADMIN'); // dup
        $user->addRole('role_billing');

        $this->assertEqualsCanonicalizing(
            [UserRoleEnum::DEFAULT->value, 'ROLE_ADMIN', 'ROLE_BILLING'],
            $user->getRoles(),
        );
    }

    public function testAddRoleIgnoresDefaultRoleSoItIsNotStoredTwice(): void
    {
        $user = new User();

        // ROLE_USER is auto-injected by getRoles(); addRole should not store it again.
        $user->addRole(UserRoleEnum::DEFAULT->value);

        $this->assertSame([UserRoleEnum::DEFAULT->value], $user->getRoles());
    }

    public function testRemoveRoleCompactsRolesArray(): void
    {
        $user = (new User())
            ->addRole('role_a')
            ->addRole('role_b')
            ->addRole('role_c');

        $user->removeRole('role_b');

        $this->assertEqualsCanonicalizing(
            [UserRoleEnum::DEFAULT->value, 'ROLE_A', 'ROLE_C'],
            $user->getRoles(),
        );
        $this->assertNotContains('ROLE_B', $user->getRoles());
    }

    public function testHasRoleIsCaseInsensitive(): void
    {
        $user = (new User())->addRole('role_super_admin');

        $this->assertTrue($user->hasRole('ROLE_SUPER_ADMIN'));
        $this->assertTrue($user->hasRole('role_super_admin'));
        $this->assertFalse($user->hasRole('role_other'));
    }

    public function testSetSuperAdminToggleAddsAndRemovesSuperAdminRole(): void
    {
        $user = new User();

        $user->setSuperAdmin(true);
        $this->assertTrue($user->hasRole(UserRoleEnum::SUPER_ADMIN->value));

        $user->setSuperAdmin(false);
        $this->assertFalse($user->hasRole(UserRoleEnum::SUPER_ADMIN->value));
        // ROLE_USER must remain — only the SUPER_ADMIN role is removed.
        $this->assertTrue($user->hasRole(UserRoleEnum::DEFAULT->value));
    }

    public function testGetFullNameConcatenatesFirstAndLast(): void
    {
        $user = (new User())->setFirstName('Vandeth')->setLastName('Tho');

        $this->assertSame('Vandeth Tho', $user->getFullName());
    }

    public function testSetRolesReplacesExistingRoles(): void
    {
        $user = (new User())->addRole('role_a')->addRole('role_b');

        $user->setRoles(['role_c']);

        $this->assertEqualsCanonicalizing(
            [UserRoleEnum::DEFAULT->value, 'ROLE_C'],
            $user->getRoles(),
        );
        $this->assertNotContains('ROLE_A', $user->getRoles());
        $this->assertNotContains('ROLE_B', $user->getRoles());
    }

    public function testEraseCredentialsClearsPlainPasswordOnly(): void
    {
        $user = (new User())
            ->setPassword('hashed')
            ->setPlainPassword('plain');

        $user->eraseCredentials();

        $this->assertNull($user->getPlainPassword());
        $this->assertSame('hashed', $user->getPassword());
    }
}

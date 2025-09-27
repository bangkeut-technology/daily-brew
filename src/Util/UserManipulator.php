<?php

declare(strict_types=1);

namespace App\Util;

use App\Entity\User;
use App\Enum\UserRoleEnum;
use App\Repository\UserRepository;
use Random\RandomException;

/**
 * Class UserManipulator.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class UserManipulator implements UserManipulatorInterface
{
    /**
     * UserManipulator constructor.
     */
    public function __construct(
        private UserRepository $userRepository,
    ) {
    }

    /**
     * Creates a new user with the given email, password, first name, and last name.
     *
     * @param string      $email     The email of the new user
     * @param string      $password  The password of the new user
     * @param string|null $firstName The first name of the new user (optional)
     * @param string|null $lastName  The last name of the new user (optional)
     * @param UserRoleEnum    $role      The role of the new user (default is UserRoleEnum::DEFAULT)
     *
     * @return User The created user
     */
    public function create(
        string $email,
        string $password,
        ?string $firstName,
        ?string $lastName,
        UserRoleEnum $role = UserRoleEnum::DEFAULT,
    ): User {
        $user = $this->userRepository->create();
        $user->setEmail($email);
        $user->setFirstName($firstName);
        $user->setLastName($lastName);
        $user->setPlainPassword($password);
        $user->addRole($role->value);
        $this->userRepository->updateUser($user);

        return $user;
    }

    /**
     * Activates a user.
     *
     * @param string $email the email of the user to be activated
     */
    public function activate(string $email): void
    {
        $user = $this->findUserByIdentifier($email);
        $user->setEnabled(true);
        $this->userRepository->updateUser($user);
    }

    /**
     * Deactivates a user by setting their enabled status to false.
     *
     * @param string $email The email identifier of the user to deactivate
     *
     * @throws RandomException
     */
    public function deactivate(string $email): void
    {
        $user = $this->findUserByIdentifier($email);
        $user->setEnabled(false);
        $this->userRepository->updateUser($user);
    }

    /**
     * Changes the password for the given user.
     *
     * @param string $email    the email of the user
     * @param string $password the new password
     *
     * @throws RandomException
     */
    public function changePassword(string $email, string $password): void
    {
        $user = $this->findUserByIdentifier($email);
        $user->setPlainPassword($password);
        $this->userRepository->updateUser($user);
    }

    /**
     * Promotes a user identified by email.
     *
     * @param string $email        The email of the user to be promoted
     * @param bool   $isSuperAdmin Whether the user should be promoted to super admin
     *
     * @throws RandomException
     */
    public function promote(string $email, bool $isSuperAdmin = false): void
    {
        $user = $this->findUserByIdentifier($email);

        $user->setSuperAdmin($isSuperAdmin);

        $this->userRepository->updateUser($user);
    }

    /**
     * Demotes a user by removing their roles.
     *
     * @param string $email the email of the user to demote
     *
     * @throws RandomException
     */
    public function demote(string $email): void
    {
        $user = $this->findUserByIdentifier($email);

        $this->userRepository->updateUser($user);
    }

    /**
     * Adds a role to the given user.
     *
     * @return bool true if role was added, false if user already had the role
     *
     * @throws RandomException
     */
    public function addRole(string $email, string $role): bool
    {
        $user = $this->findUserByIdentifier($email);
        if ($user->hasRole($role)) {
            return false;
        }
        $user->addRole($role);
        $this->userRepository->updateUser($user);

        return true;
    }

    /**
     * Removes role from the given user.
     *
     * @return bool true if role was removed, false if user didn't have the role
     *
     * @throws RandomException
     */
    public function removeRole(string $email, string $role): bool
    {
        $user = $this->findUserByIdentifier($email);
        if (!$user->hasRole($role)) {
            return false;
        }
        $user->removeRole($role);
        $this->userRepository->updateUser($user);

        return true;
    }

    /**
     * Finds a user by identifier.
     *
     * @return User the user object
     */
    private function findUserByIdentifier(string $identifier): User
    {
        $user = $this->userRepository->findByIdentifier($identifier);

        if (!$user) {
            throw new \InvalidArgumentException(sprintf('User identified by "%s" does not exist.', $identifier));
        }

        return $user;
    }
}

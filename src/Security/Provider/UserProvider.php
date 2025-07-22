<?php

declare(strict_types=1);

namespace App\Security\Provider;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

/**
 * Class UserProvider.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class UserProvider implements UserProviderInterface
{
    /**
     * UserProvider constructor.
     *
     * @param UserRepository $userRepository The user repository
     */
    public function __construct(
        private UserRepository $userRepository,
        private RequestStack $request,
    ) {
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Invalid user class "%s".', $user::class));
        }

        /** @var UserInterface $reloadedUser */
        if (null === $reloadedUser = $this->userRepository->findById($user->getId())) {
            throw new UserNotFoundException(sprintf('User "%s" could not be reloaded.', $user->getId()));
        }

        return $reloadedUser;
    }

    public function supportsClass(string $class): bool
    {
        return User::class === $class;
    }

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        if ('daily_brew_api_v1_login' === $this->request->getCurrentRequest()) {
            throw new UserNotFoundException('User not found');
        }
        if (null === $user = $this->userRepository->findByIdentifier($identifier)) {
            throw new UserNotFoundException(sprintf('User "%s" could not be found.', $identifier));
        }

        return $user;
    }
}

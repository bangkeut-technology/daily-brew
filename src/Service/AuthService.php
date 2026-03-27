<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AuthService
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
    ) {}

    public function register(string $email, string $password): User
    {
        $existing = $this->userRepository->findByEmail($email);
        if ($existing !== null) {
            throw new \InvalidArgumentException('Email already in use');
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }

    public function findOrCreateGoogleUser(string $googleId, string $email): User
    {
        // Match by Google ID — already linked
        $user = $this->userRepository->findByGoogleId($googleId);
        if ($user !== null) {
            return $user;
        }

        // Email already taken by an account without this Google ID linked
        $existing = $this->userRepository->findByEmail($email);
        if ($existing !== null) {
            throw new \InvalidArgumentException(
                'An account with this email already exists. Sign in with your existing method and link Google from your profile.'
            );
        }

        $user = new User();
        $user->setEmail($email);
        $user->setGoogleId($googleId);
        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }

    public function findOrCreateAppleUser(string $appleId, string $email): User
    {
        // Match by Apple ID — already linked
        $user = $this->userRepository->findByAppleId($appleId);
        if ($user !== null) {
            return $user;
        }

        // Email already taken by an account without this Apple ID linked
        $existing = $this->userRepository->findByEmail($email);
        if ($existing !== null) {
            throw new \InvalidArgumentException(
                'An account with this email already exists. Sign in with your existing method and link Apple from your profile.'
            );
        }

        $user = new User();
        $user->setEmail($email);
        $user->setAppleId($appleId);
        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }

    /**
     * Link a Google account to the currently logged-in user.
     */
    public function connectGoogle(User $user, string $googleId): void
    {
        // Ensure this Google ID isn't already linked to a different user
        $existing = $this->userRepository->findByGoogleId($googleId);
        if ($existing !== null && $existing->getId() !== $user->getId()) {
            throw new \InvalidArgumentException('This Google account is already linked to another user');
        }

        $user->setGoogleId($googleId);
        $this->em->flush();
    }

    public function disconnectGoogle(User $user): void
    {
        if ($user->getGoogleId() === null) {
            throw new \InvalidArgumentException('No Google account linked');
        }

        $this->ensureHasAlternativeLogin($user, 'google');

        $user->setGoogleId(null);
        $this->em->flush();
    }

    /**
     * Link an Apple account to the currently logged-in user.
     */
    public function connectApple(User $user, string $appleId): void
    {
        // Ensure this Apple ID isn't already linked to a different user
        $existing = $this->userRepository->findByAppleId($appleId);
        if ($existing !== null && $existing->getId() !== $user->getId()) {
            throw new \InvalidArgumentException('This Apple account is already linked to another user');
        }

        $user->setAppleId($appleId);
        $this->em->flush();
    }

    public function disconnectApple(User $user): void
    {
        if ($user->getAppleId() === null) {
            throw new \InvalidArgumentException('No Apple account linked');
        }

        $this->ensureHasAlternativeLogin($user, 'apple');

        $user->setAppleId(null);
        $this->em->flush();
    }

    /**
     * Prevent disconnecting the last login method — user would be locked out.
     */
    private function ensureHasAlternativeLogin(User $user, string $excluding): void
    {
        $hasPassword = $user->getPassword() !== null;
        $hasGoogle = $excluding !== 'google' && $user->getGoogleId() !== null;
        $hasApple = $excluding !== 'apple' && $user->getAppleId() !== null;

        if (!$hasPassword && !$hasGoogle && !$hasApple) {
            throw new \InvalidArgumentException('Cannot disconnect — this is your only login method');
        }
    }
}

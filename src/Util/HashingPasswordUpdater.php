<?php

declare(strict_types=1);

namespace App\Util;

use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\PasswordHasherFactoryInterface;

/**
 * Class HashingPasswordUpdater.
 *
 * Class updating the hashed password in the user when there is a new password.
 *
 * @author Vandeth THO <thovandeth@gmail.com>
 */
readonly class HashingPasswordUpdater implements HashingPasswordUpdaterInterface
{
    /**
     * HashingPasswordUpdater constructor.
     */
    public function __construct(
        private PasswordHasherFactoryInterface $passwordHasherFactory,
    ) {
    }

    public function hashPassword(User $user): void
    {
        $plainPassword = $user->getPlainPassword();

        if (null === $plainPassword || '' === $plainPassword) {
            return;
        }

        $encoder = $this->passwordHasherFactory->getPasswordHasher($user);

        $hashedPassword = $encoder->hash($plainPassword);
        $user->setPassword($hashedPassword);
        $user->eraseCredentials();
    }
}

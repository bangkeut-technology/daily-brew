<?php

namespace App\Util;

use App\Entity\User;

/**
 * Interface HashingPasswordUpdaterInterface.
 *
 * @author Vandeth Tho <thovandeth@gmail.com>
 */
interface HashingPasswordUpdaterInterface
{
    /**
     * Updates the hashed password in the user when there is a new password.
     *
     * The implement should be a no-op in case there is no new password (it should not erase the
     * existing hash with a wrong one).
     */
    public function hashPassword(User $user): void;
}

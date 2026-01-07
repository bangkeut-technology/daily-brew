<?php
declare(strict_types=1);

namespace App\Event\User;

use App\Entity\User;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Class UserSignedUpEvent
 *
 * @package App\Event\User
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class UserSignedUpEvent extends Event
{
    public function __construct(
        public readonly User $user,
    ) {}
}

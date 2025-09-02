<?php
declare(strict_types=1);

namespace App\Event\User;

use App\Entity\User;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Class UserRegisteredEvent
 *
 * @package App\Event\User
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class UserRegisteredEvent extends Event
{
    public function __construct(
        public readonly User $user,
    ) {}
}

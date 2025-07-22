<?php

declare(strict_types=1);

namespace App\Event\Employee;

use App\Entity\User;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Class CheckEmployeeLimitEvent.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class CheckEmployeeLimitEvent extends Event
{
    public function __construct(
        public readonly User $user,
    ) {
    }
}

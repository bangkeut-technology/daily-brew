<?php
declare(strict_types=1);

namespace App\Event\AttendanceBatch;

use App\Entity\AttendanceBatch;
use App\Entity\User;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Class AttendanceBatchUpdatedEvent
 *
 * @package App\Event\AttendanceBatch
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class AttendanceBatchUpdatedEvent extends Event
{
    /**
     * Represents the event triggered when an attendance batch is updated.
     *
     * @param AttendanceBatch $batch     The attendance batch that is created.
     * @param User            $user      The user associated with the event.
     */
    public function __construct(
        public readonly AttendanceBatch  $batch,
        public readonly User             $user,
    )
    {
    }
}

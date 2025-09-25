<?php
declare(strict_types=1);

namespace App\Event\AttendanceBatch;

use App\Entity\AttendanceBatch;
use App\Entity\Employee;
use App\Entity\User;
use Doctrine\Common\Collections\Collection;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Class AttendanceBatchCreatedEvent
 *
 * @package App\Event\AttendanceBatch
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class AttendanceBatchCreatedEvent extends Event
{
    /**
     * Represents the event triggered when an attendance batch is created.
     *
     * @param AttendanceBatch $batch     The attendance batch that is created.
     * @param User            $user      The user associated with the event.
     * @param Employee[]      $employees The list of employees associated with the batch.
     */
    public function __construct(
        public readonly AttendanceBatch  $batch,
        public readonly User             $user,
        public readonly array|Collection $employees = [],
    )
    {
    }
}

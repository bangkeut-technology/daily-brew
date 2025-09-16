<?php
declare(strict_types=1);

namespace App\Event\AttendanceBatch;

use App\Entity\AttendanceBatch;
use App\Entity\Employee;
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
     * @param AttendanceBatch $batch
     * @param Employee[]      $employees
     */
    public function __construct(
        public readonly AttendanceBatch $batch,
        public readonly array          $employees = [],
    )
    {
    }
}

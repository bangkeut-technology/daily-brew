<?php
declare(strict_types=1);

namespace App\Event\Attendance;

use App\Entity\AttendanceBatch;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Class AttendanceBatchCreatedEvent
 *
 * @package App\Event\Attendance
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class AttendanceBatchCreatedEvent extends Event
{
    public function __construct(public readonly AttendanceBatch $batch) {}
}

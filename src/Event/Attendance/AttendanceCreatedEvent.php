<?php
declare(strict_types=1);

namespace App\Event\Attendance;

use App\Entity\Attendance;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Class AttendanceCreatedEvent
 *
 * @package App\Event\Attendance
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class AttendanceCreatedEvent extends Event
{
    public function __construct(
        public Attendance $attendance
    )
    {
    }
}

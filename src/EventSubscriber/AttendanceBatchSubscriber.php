<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Event\AttendanceBatch\AttendanceBatchCreatedEvent;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Class AttendanceBatchSubscriber
 *
 * @package App\EventSubscriber
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class AttendanceBatchSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private AttendanceRepository $attendanceRepository,
        private EmployeeRepository   $employeeRepository,
    )
    {
    }

    /**
     * @inheritDoc
     */
    public static function getSubscribedEvents(): array
    {
        return [AttendanceBatchCreatedEvent::class => 'onCreated'];
    }


    public function onCreated(AttendanceBatchCreatedEvent $event): void
    {

    }
}

<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Event\AttendanceBatch\AttendanceBatchCreatedEvent;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use DateMalformedStringException;
use DateTimeImmutable;
use Generator;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class AttendanceBatchSubscriber
 *
 * @package App\EventSubscriber
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class AttendanceBatchSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private AttendanceRepository $attendanceRepository,
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
        $employees = $event->employees;
        $batch = $event->batch;
        $user = $event->user;
        $type = $batch->getType();
        $from = $batch->getFromDate();
        $to = $batch->getToDate();
        $interval = $from->diff($to);

        foreach ($employees as $employee) {
            $exists = $this->attendanceRepository->findByEmployeeAndPeriod($employee, $from, $to);
            foreach ($this->days($from, $to) as $day) {
                $attendance = $this->attendanceRepository->create();
                $attendance->setUser($user);
                $attendance->setEmployee($employee);
                $attendance->setBatch($batch);
                $attendance->setType($type);
            }
        }
    }

    /**
     * Generates a range of days between two given dates, inclusive.
     *
     * @param DateTimeImmutable $from The start date of the range.
     * @param DateTimeImmutable $to   The end date of the range.
     *
     * @return Generator<DateTimeImmutable> A generator yielding each date in the range.
     * @throws DateMalformedStringException
     */
    private function days(DateTimeImmutable $from, DateTimeImmutable $to): Generator {
        for ($d = $from; $d <= $to; $d = $d->modify('+1 day')) {
            yield $d;
        }
    }
}

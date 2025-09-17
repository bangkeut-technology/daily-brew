<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Event\AttendanceBatch\AttendanceBatchCreatedEvent;
use App\Repository\AttendanceRepository;
use DateMalformedStringException;
use DateTimeImmutable;
use Generator;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

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


    /**
     * Handles the creation of attendance records when an AttendanceBatchCreatedEvent is triggered.
     *
     * @param AttendanceBatchCreatedEvent $event The event containing details of the attendance batch creation, including employees, batch data, and user information.
     *
     * @return void
     * @throws DateMalformedStringException
     */
    public function onCreated(AttendanceBatchCreatedEvent $event): void
    {
        $employees = $event->employees;
        $batch = $event->batch;
        $user = $event->user;
        $type = $batch->getType();
        $from = $batch->getFromDate();
        $to = $batch->getToDate();

        foreach ($employees as $employee) {
            $exists = $this->attendanceRepository->getExistDatesByEmployeeAndPeriod($employee, $from, $to);
            foreach ($this->days($from, $to) as $day) {
                if ($this->isDateExist($day, $exists)) {
                    continue;
                }
                $attendance = $this->attendanceRepository->create();
                $attendance->setUser($user);
                $attendance->setEmployee($employee);
                $attendance->setBatch($batch);
                $attendance->setType($type);
                $attendance->setAttendanceDate($day);

                $this->attendanceRepository->update($attendance, false);
            }
            $this->attendanceRepository->flush();
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
    private function days(DateTimeImmutable $from, DateTimeImmutable $to): Generator
    {
        for ($d = $from; $d <= $to; $d = $d->modify('+1 day')) {
            yield $d;
        }
    }

    /**
     * Checks if the given date exists in the provided array of dates.
     *
     * @param DateTimeImmutable   $date  The date to check.
     * @param DateTimeImmutable[] $dates An array of DateTimeImmutable objects to search within.
     *
     * @return bool True if the date exists in the array, false otherwise.
     */
    private function isDateExist(DateTimeImmutable $date, array $dates): bool
    {
        return array_any($dates, fn($d) => $d->format('Y-m-d') === $date->format('Y-m-d'));
    }
}

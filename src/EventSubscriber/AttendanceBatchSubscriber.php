<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Event\AttendanceBatch\AttendanceBatchCreatedEvent;
use App\Repository\AttendanceRepository;
use DateMalformedStringException;
use DateTimeImmutable;
use DateTimeInterface;
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
        return [
            AttendanceBatchCreatedEvent::class => 'onCreated'
        ];
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
        $batch = $event->batch;
        $user = $event->user;
        $employees = $batch->getEmployees();
        $type = $batch->getType();
        $from = $batch->getFromDate();
        $to = $batch->getToDate();

        $days = [];
        for ($d = $from; $d <= $to; $d = $d->modify('+1 day')) {
            $days[] = $d->format('Y-m-d');
        }

        if ($employees->isEmpty() || empty($days)) {
            return;
        }

        $existing = $this->attendanceRepository->getExistingByEmployeesAndPeriod($employees, $from, $to);

        $existingMap = [];
        foreach ($existing as $row) {
            $empId = (int)$row['employee_id'];
            $key = $row['date'] instanceof DateTimeInterface ? $row['date']->format('Y-m-d') : new DateTimeImmutable($row['date'])->format('Y-m-d');
            $existingMap[$empId][$key] = true;
        }

        $batchSize = 20;

        foreach ($employees as $index => $employee) {
            $empId = $employee->id;
            $existsForEmp = $existingMap[$empId] ?? [];

            foreach ($days as $day) {
                if (isset($existsForEmp[$day])) {
                    continue;
                }

                $attendance = $this->attendanceRepository->create();
                $attendance->setUser($user);
                $attendance->setEmployee($employee);
                $attendance->setBatch($batch);
                $attendance->setType($type);
                $attendance->setAttendanceDate(new DateTimeImmutable($day));

                $this->attendanceRepository->update($attendance, false);

                if (($index % $batchSize) === 0) {
                    $this->attendanceRepository->flush();
                }
            }
        }

        $this->attendanceRepository->flush();
    }

}

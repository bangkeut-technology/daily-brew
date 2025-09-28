<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Event\AttendanceBatch\AttendanceBatchCreatedEvent;
use App\Event\AttendanceBatch\AttendanceBatchDeletedEvent;
use App\Event\AttendanceBatch\AttendanceBatchUpdatedEvent;
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
            AttendanceBatchCreatedEvent::class => 'onCreated',
            AttendanceBatchUpdatedEvent::class => 'onUpdated',
            AttendanceBatchDeletedEvent::class => 'onDeleted',
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

        $days = $this->getDaysFromPeriod($from, $to);

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

    /**
     * Handles the update of attendance records when an AttendanceBatchUpdatedEvent is triggered.
     *
     * This method ensures that attendance records are synchronized with the updated batch details,
     * including the date range and associated employees. It performs the following operations:
     * - Builds a desired set of attendance records based on the updated batch information.
     * - Loads existing attendance records for the batch and indexes them for quick lookup.
     * - Inserts new attendance records for any missing entries in the desired set.
     * - Updates existing records if their status has changed.
     * - Deletes any records that are no longer needed based on the updated batch details.
     *
     * @param AttendanceBatchUpdatedEvent $event The event containing details of the attendance batch update, including the updated batch data.
     *
     * @return void
     * @throws DateMalformedStringException
     */
    public function onUpdated(AttendanceBatchUpdatedEvent $event): void
    {
        $batch = $event->batch;
        $user = $event->user;
        $employees = $batch->getEmployees();
        $type = $batch->getType();
        $from = $batch->getFromDate();
        $to = $batch->getToDate();

        $days = $this->getDaysFromPeriod($from, $to);

        $employees = $batch->getEmployees();
        $empIds = array_map(static fn($e) => $e->getId(), $employees->toArray());

        $desired = [];
        foreach ($empIds as $eid) foreach ($days as $day) $desired["$eid|$day"] = true;

        // B) Load existing batch rows (one query) and index
        $existingRows = $this->attendanceRepository->findByBatch($batch); // returns Attendance[]
        $existing = []; // key => entity
        foreach ($existingRows as $a) {
            $key = $a->getEmployee()->getId().'|'.$a->getAttendanceDate()->format('Y-m-d');
            $existing[$key] = $a;
        }

        $type = $batch->getType(); // or map from type
        $em = $this->attendanceRepository->getEntityManager();

        // C) Insert or update
        $ops = 0;
        foreach ($desired as $key => $_) {
            if (isset($existing[$key])) {
                // Update status if changed (optional)
                $a = $existing[$key];
                if ($a->getType() !== $type) {
                    $a->setType($type);
                    $ops++;
                }
                unset($existing[$key]); // mark as kept
            } else {
                // parse key back
                [$eid, $day] = explode('|', $key, 2);
                $employee = $this->employeeRepository->find((int)$eid);
                if (!$employee) continue;

                $a = $this->attendanceRepository->create();
                $a->setBatch($batch);
                $a->setEmployee($employee);
                $a->setAttendanceDate(new DateTimeImmutable($day));
                $a->setType($type);
                $this->attendanceRepository->update($a, false);
                if ((++$ops % 200) === 0) $this->attendanceRepository->flush();
            }
        }

        if (!empty($existing)) {
            $toDeleteIds = array_map(static fn($a) => $a->getId(), $existing);
            $this->attendanceRepository->bulkDeleteByIds($toDeleteIds);
        }

        $this->attendanceRepository->flush();
    }


    /**
     * @throws DateMalformedStringException
     */
    private function getDaysFromPeriod(DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $days = [];
        for ($d = $from; $d <= $to; $d = $d->modify('+1 day')) {
            $days[] = $d->format('Y-m-d');
        }
        return $days;

    }
}

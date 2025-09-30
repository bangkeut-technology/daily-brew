<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Entity\AttendanceBatch;
use App\Entity\User;
use App\Enum\AttendanceTypeEnum;
use App\Enum\LeaveTypeEnum;
use App\Event\AttendanceBatch\AttendanceBatchCreatedEvent;
use App\Event\AttendanceBatch\AttendanceBatchDeletedEvent;
use App\Event\AttendanceBatch\AttendanceBatchUpdatedEvent;
use App\Repository\AttendanceRepository;
use App\Service\AttendanceRateCalculator;
use App\Service\SettingService;
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
    private int $batchSize;

    public function __construct(
        private AttendanceRepository     $attendanceRepository,
    )
    {
        $this->batchSize = 20;
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
        $this->fillMissingAttendance($event->batch, $event->user);
    }

    /**
     * Handles the update of attendance records when an AttendanceBatchUpdatedEvent is triggered.
     *
     * This method ensures that attendance records are synchronized with the updated batch details,
     * including the date range and associated employees. It performs the following operations:
     * - Builds a desired set of attendance records based on the updated batch information.
     * - Loads existing attendance records for the batch and indexes them for a quick lookup.
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
        $from = $batch->getFromDate();
        $to = $batch->getToDate();

        // Remove attendances that are outside the new date range
        $this->attendanceRepository->deleteOutsideDateRangeByBatch($batch, $from, $to);

        // Remove attendances that are for employees no longer in the batch
        $this->attendanceRepository->deleteByBatchExcludingEmployees($batch, $batch->getEmployees());

        // Fill missing attendances within the new date range
        $this->fillMissingAttendance($batch, $user);

        // Update existing attendances to match the new type
        $this->attendanceRepository->updateTypeForBatch($batch, $batch->getType());
    }

    /**
     * Handles the deletion of attendance records when an AttendanceBatchDeletedEvent is triggered.
     *
     * This method deletes all attendance records associated with the specified attendance batch.
     * It iterates through each attendance record linked to the batch and removes it from the repository.
     * To optimize performance, it flushes the changes to the database in batches of 20 records.
     *
     * @param AttendanceBatchDeletedEvent $event The event containing details of the attendance batch deletion, including the batch data.
     *
     * @return void
     */
    public function onDeleted(AttendanceBatchDeletedEvent $event): void
    {
        $batch = $event->batch;

        $this->attendanceRepository->deleteByBatch($batch);
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

    /**
     * Fills in missing attendance records for a given batch and user.
     *
     * This function retrieves the list of employees and the period from the provided attendance batch.
     * It calculates the days within the specified period and ensures that attendance records
     * exist for each day and employee within the batch. If records are missing, they are created
     * and persisted in the database.
     *
     * The function processes attendance in batches to minimize memory usage and optimize performance.
     *
     * @param AttendanceBatch $batch The attendance batch containing employees, type, and date period.
     * @param User            $user  The user responsible for the attendance updates.
     *
     * @return void
     * @throws DateMalformedStringException
     */
    private function fillMissingAttendance(
        AttendanceBatch $batch,
        User            $user,
    ): void
    {
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

        foreach ($employees as $index => $employee) {
            $empId = $employee->id;
            $existsForEmp = $existingMap[$empId] ?? [];
            $paidCount = $this->attendanceRepository->countPaidLeavesBetween($employee, $from, $to);

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
                if ($type === AttendanceTypeEnum::LEAVE) {
                    $attendance->setLeaveType($paidCount < 3 ? LeaveTypeEnum::PAID : LeaveTypeEnum::UNPAID);
                }

                $this->attendanceRepository->update($attendance, false);

                if ($index % $this->batchSize === 0) {
                    $this->attendanceRepository->flush();
                }
            }
        }

        $this->attendanceRepository->flush();
    }
}

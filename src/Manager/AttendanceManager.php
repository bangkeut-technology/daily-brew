<?php
declare(strict_types=1);

namespace App\Manager;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\User;
use App\Enum\AttendanceTypeEnum;
use App\Repository\AttendanceRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Class AttendanceManager
 *
 * @package App\Manager
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class AttendanceManager implements AttendanceManagerInterface
{
    public function __construct(
        private AttendanceRepository $attendanceRepository,
    ) {
    }

    public function clockIn(Employee $employee, ?User $actor = null, ?DateTimeImmutable $now = null): Attendance
    {
        $now ??= new DateTimeImmutable('now');

        $attendanceDate = $now->setTime(0, 0, 0);
        $attendance = $this->attendanceRepository->findOneBy([
            'employee'       => $employee,
            'attendanceDate' => $attendanceDate,
        ]);

        if ($attendance instanceof Attendance) {
            if ($attendance->isCheckedIn()) {
                return $attendance;
            }

            if ($attendance->hasCompletedDay()) {
                return $attendance;
            }

            if ($attendance->getType() === AttendanceTypeEnum::LEAVE) {
                return $attendance;
            }
        } else {
            $attendance = new Attendance()
                ->setEmployee($employee)
                ->setAttendanceDate($attendanceDate)
                ->setType(AttendanceTypeEnum::PRESENT);
        }

        $attendance
            ->setClockIn($now)
            ->setUser($actor);

        $this->attendanceRepository->update($attendance);

        return $attendance;
    }

    public function clockOut(Employee $employee, ?User $actor = null, ?DateTimeImmutable $now = null): Attendance
    {
        $now ??= new DateTimeImmutable('now');
        $attendanceDate = $now->setTime(0, 0, 0);

        /** @var Attendance|null $attendance */
        $attendance = $this->attendanceRepository->findOneBy([
            'employee'       => $employee,
            'attendanceDate' => $attendanceDate,
        ]);

        if (!$attendance instanceof Attendance) {
            // no clock-in but trying to clock-out → decide: create record or error
            $attendance = (new Attendance())
                ->setEmployee($employee)
                ->setAttendanceDate($attendanceDate)
                ->setType(AttendanceTypeEnum::PRESENT)
                ->setClockIn($now); // or null; business decision
        }

        if ($attendance->hasCompletedDay()) {
            // already clocked-out; ignore or error
            return $attendance;
        }

        if ($attendance->getClockIn() === null) {
            // optional: auto-set clockIn to same day at opening time
            $attendance->setClockIn($now); // or some default store opening time
        }

        $attendance
            ->setClockOut($now)
            ->setUser($actor);

        $this->attendanceRepository->update($attendance);

        return $attendance;
    }
}


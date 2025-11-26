<?php
declare(strict_types=1);

namespace App\Manager;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\User;
use DateTimeImmutable;

/**
 * Interface AttendanceManagerInterface
 *
 * @package App\Manager
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
interface AttendanceManagerInterface
{
    /**
     * Clock in an employee for attendance
     *
     * @param Employee               $employee Employee to clock in
     * @param User|null              $actor    User clocking in
     * @param DateTimeImmutable|null $now      Current time
     * @return Attendance
     */
    public function clockIn(Employee $employee, ?User $actor = null, ?DateTimeImmutable $now = null): Attendance;

    /**
     * Clock out an employee for attendance
     *
     * @param Employee               $employee Employee to clock out
     * @param User|null              $actor    User clocking out
     * @param DateTimeImmutable|null $now      Current time
     * @return Attendance
     */
    public function clockOut(Employee $employee, ?User $actor = null, ?DateTimeImmutable $now = null): Attendance;
}

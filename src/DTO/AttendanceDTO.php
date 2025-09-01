<?php
declare(strict_types=1);

namespace App\DTO;

use App\Entity\Attendance;
use App\Enum\AttendanceStatusEnum;
use DateTimeImmutable;

/**
 * Class EmployeeDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class AttendanceDTO
{
    public function __construct(
        public int                  $id,
        public string               $publicId,
        public DateTimeImmutable    $attendanceDate,
        public AttendanceStatusEnum $status,
        public ?DateTimeImmutable   $clockIn = null,
        public ?DateTimeImmutable   $clockOut = null,
        public ?string              $note = null,
        public ?EmployeeDTO         $employee = null,
        public ?UserDTO             $user = null,
    )
    {
    }

    /**
     * Creates an instance of the class from an Attendance entity.
     *
     * @param Attendance $attendance The Attendance entity instance to convert.
     *
     * @return self A new instance of the class populated with data from the Attendance entity.
     */
    public static function fromEntity(Attendance $attendance, bool $withEmployee = true): self
    {
        $class = new self(
            id: $attendance->getId(),
            publicId: $attendance->getPublicId(),
            attendanceDate: $attendance->getAttendanceDate(),
            status: $attendance->getStatus(),
            clockIn: $attendance->getClockIn(),
            clockOut: $attendance->getClockOut(),
            note: $attendance->getNote(),
        );

        if ($withEmployee) {
            $class->employee = EmployeeDTO::fromEntity($attendance->getEmployee());
        }

        return $class;
    }
}


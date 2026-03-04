<?php
declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\Attendance;
use App\Enum\AttendanceTypeEnum;
use DateTimeImmutable;

/**
 * Class EmployeeDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class AttendanceDTO
{
    use HasEntityMapper;

    public function __construct(
        public int                $id,
        public string             $publicId,
        public DateTimeImmutable  $attendanceDate,
        public AttendanceTypeEnum $type,
        public ?DateTimeImmutable $clockIn = null,
        public ?DateTimeImmutable $clockOut = null,
        public ?string            $note = null,
        public ?EmployeeDTO       $employee = null,
        public ?UserDTO           $user = null,
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
        return new self(
            id: $attendance->id,
            publicId: $attendance->publicId,
            attendanceDate: $attendance->getAttendanceDate(),
            type: $attendance->getType(),
            clockIn: $attendance->getClockIn(),
            clockOut: $attendance->getClockOut(),
            note: $attendance->getNote(),
            employee: $withEmployee ? EmployeeDTO::fromEntity($attendance->getEmployee()) : null,
        );
    }
}


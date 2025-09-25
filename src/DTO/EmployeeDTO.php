<?php
declare(strict_types=1);

namespace App\DTO;

use App\Entity\Employee;
use App\Enum\EmployeeStatusEnum;
use DateTimeImmutable;

/**
 * Class EmployeeDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final  class EmployeeDTO
{
    public function __construct(
        public readonly int                $id,
        public readonly string             $publicId,
        public readonly string             $firstName,
        public readonly string             $lastName,
        public readonly string             $fullName,
        public readonly ?string            $phoneNumber = null,
        public readonly ?DateTimeImmutable $dob = null,
        public readonly ?DateTimeImmutable $joinedAt = null,
        public readonly EmployeeStatusEnum $status,
        public ?array                      $attendances = null,
    )
    {
    }

    /**
     * Creates a new instance from an Employee entity.
     *
     * @param Employee $employee The Employee entity to transform.
     *
     * @return self A new instance of the class.
     */
    public static function fromEntity(Employee $employee, bool $withAttendances = false): self
    {
        $class = new self(
            id: $employee->id,
            publicId: $employee->publicId,
            firstName: $employee->getFirstName(),
            lastName: $employee->getLastName(),
            fullName: $employee->getFullName(),
            phoneNumber: $employee->getPhoneNumber(),
            dob: $employee->getDob(),
            joinedAt: $employee->getJoinedAt(),
            status: $employee->getStatus(),
        );

        if ($withAttendances) {
            $class->attendances = [];
        }

        return $class;
    }
}

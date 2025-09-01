<?php
declare(strict_types=1);

namespace App\DTO;

use App\Entity\Employee;

/**
 * Class EmployeeDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class EmployeeDTO
{
    public function __construct(
        public int    $id,
        public string $publicId,
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
    public static function fromEntity(Employee $employee): self
    {
        return new self(
            id: $employee->getId(),
            publicId: $employee->getPublicId(),
        );
    }
}

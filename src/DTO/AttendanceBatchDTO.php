<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\AttendanceBatch;
use App\Enum\AttendanceTypeEnum;
use DateTimeImmutable;

final class AttendanceBatchDTO
{
    use HasEntityMapper;

    public function __construct(
        public readonly int               $id,
        public readonly string            $publicId,
        public readonly AttendanceTypeEnum $type,
        public readonly string            $label,
        public readonly ?string           $note,
        public readonly DateTimeImmutable $fromDate,
        public readonly DateTimeImmutable $toDate,
        public array                      $employees = [],
    ) {
    }

    public static function fromEntity(AttendanceBatch $batch, bool $withEmployees = false): self
    {
        $dto = new self(
            id: $batch->id,
            publicId: $batch->publicId,
            type: $batch->getType(),
            label: $batch->getLabel(),
            note: $batch->getNote(),
            fromDate: $batch->getFromDate(),
            toDate: $batch->getToDate(),
        );

        if ($withEmployees) {
            foreach ($batch->getEmployees() as $employee) {
                $dto->employees[] = EmployeeDTO::fromEntity($employee);
            }
        }

        return $dto;
    }
}

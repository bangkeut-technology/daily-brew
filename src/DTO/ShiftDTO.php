<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\Shift;
use DateTimeImmutable;

/**
 * Class ShiftDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class ShiftDTO
{
    use HasEntityMapper;

    public function __construct(
        public readonly int               $id,
        public readonly string            $publicId,
        public readonly string            $name,
        public readonly int               $graceLateMinutes,
        public readonly int               $graceEarlyMinutes,
        public array                      $timeRules = [],
        public array                      $employees = [],
        public readonly ?DateTimeImmutable $createdAt = null,
        public readonly ?DateTimeImmutable $updatedAt = null,
    ) {
    }

    public static function fromEntity(Shift $shift, bool $withDetails = false): self
    {
        $dto = new self(
            id: $shift->id,
            publicId: $shift->publicId,
            name: $shift->getName(),
            graceLateMinutes: $shift->getGraceLateMinutes(),
            graceEarlyMinutes: $shift->getGraceEarlyMinutes(),
            createdAt: $shift->getCreatedAt(),
            updatedAt: $shift->getUpdatedAt(),
        );

        if ($withDetails) {
            foreach ($shift->getTimeRules() as $rule) {
                $dto->timeRules[] = ShiftTimeRuleDTO::fromEntity($rule);
            }

            foreach ($shift->getEmployees() as $employee) {
                $dto->employees[] = EmployeeDTO::fromEntity($employee);
            }
        }

        return $dto;
    }
}

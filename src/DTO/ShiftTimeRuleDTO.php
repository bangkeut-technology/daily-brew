<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\ShiftTimeRule;
use App\Enum\DayOfWeekEnum;
use DateTimeImmutable;

/**
 * Class ShiftTimeRuleDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class ShiftTimeRuleDTO
{
    public function __construct(
        public int              $id,
        public string           $publicId,
        public DayOfWeekEnum    $dayOfWeek,
        public string           $dayLabel,
        public string           $startTime,
        public string           $endTime,
        public ?DateTimeImmutable $createdAt = null,
        public ?DateTimeImmutable $updatedAt = null,
    ) {
    }

    public static function fromEntity(ShiftTimeRule $rule): self
    {
        return new self(
            id: $rule->id,
            publicId: $rule->publicId,
            dayOfWeek: $rule->getDayOfWeek(),
            dayLabel: $rule->getDayOfWeek()->label(),
            startTime: $rule->getStartTime(),
            endTime: $rule->getEndTime(),
            createdAt: $rule->getCreatedAt(),
            updatedAt: $rule->getUpdatedAt(),
        );
    }
}

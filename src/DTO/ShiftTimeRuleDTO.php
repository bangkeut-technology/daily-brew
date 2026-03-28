<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\ShiftTimeRule;

final readonly class ShiftTimeRuleDTO
{
    public function __construct(
        public string $publicId,
        public int    $dayOfWeek,
        public string $dayOfWeekLabel,
        public string $startTime,
        public string $endTime,
    ) {}

    public static function fromEntity(ShiftTimeRule $r): self
    {
        return new self(
            publicId: (string) $r->getPublicId(),
            dayOfWeek: $r->getDayOfWeek()->value,
            dayOfWeekLabel: $r->getDayOfWeek()->label(),
            startTime: $r->getStartTime(),
            endTime: $r->getEndTime(),
        );
    }

    public function toArray(): array
    {
        return [
            'publicId' => $this->publicId,
            'dayOfWeek' => $this->dayOfWeek,
            'dayOfWeekLabel' => $this->dayOfWeekLabel,
            'startTime' => $this->startTime,
            'endTime' => $this->endTime,
        ];
    }
}

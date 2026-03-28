<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\Shift;

final readonly class ShiftDTO
{
    public function __construct(
        public string $publicId,
        public string $name,
        public ?string $startTime,
        public ?string $endTime,
        public int $graceLateMinutes,
        public int $graceEarlyMinutes,
        public array $timeRules,
    ) {}

    public static function fromEntity(Shift $s): self
    {
        return new self(
            publicId: (string) $s->getPublicId(),
            name: $s->getName(),
            startTime: $s->getStartTime()?->format('H:i'),
            endTime: $s->getEndTime()?->format('H:i'),
            graceLateMinutes: $s->getGraceLateMinutes(),
            graceEarlyMinutes: $s->getGraceEarlyMinutes(),
            timeRules: array_map(
                fn ($r) => ShiftTimeRuleDTO::fromEntity($r)->toArray(),
                $s->getTimeRules()->toArray(),
            ),
        );
    }

    public function toArray(): array
    {
        return [
            'publicId' => $this->publicId,
            'name' => $this->name,
            'startTime' => $this->startTime,
            'endTime' => $this->endTime,
            'graceLateMinutes' => $this->graceLateMinutes,
            'graceEarlyMinutes' => $this->graceEarlyMinutes,
            'timeRules' => $this->timeRules,
        ];
    }
}

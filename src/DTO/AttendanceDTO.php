<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\Attendance;

final readonly class AttendanceDTO
{
    public function __construct(
        public string  $publicId,
        public string  $date,
        public ?string $checkInAt,
        public ?string $checkOutAt,
        public bool    $isLate,
        public bool    $leftEarly,
        public ?string $employeePublicId = null,
        public ?string $employeeName = null,
        public ?string $shiftName = null,
    ) {}

    public static function fromEntity(Attendance $a, bool $includeEmployee = false, ?\DateTimeZone $tz = null): self
    {
        $formatTime = static function (?\DateTimeInterface $dt) use ($tz): ?string {
            if ($dt === null) return null;
            if ($tz !== null) {
                $dt = \DateTimeImmutable::createFromInterface($dt)->setTimezone($tz);
            }
            return $dt->format('H:i');
        };

        return new self(
            publicId: (string) $a->getPublicId(),
            date: $a->getDate()->format('Y-m-d'),
            checkInAt: $formatTime($a->getCheckInAt()),
            checkOutAt: $formatTime($a->getCheckOutAt()),
            isLate: $a->isLate(),
            leftEarly: $a->hasLeftEarly(),
            employeePublicId: $includeEmployee ? (string) $a->getEmployee()->getPublicId() : null,
            employeeName: $includeEmployee ? $a->getEmployee()->getName() : null,
            shiftName: $includeEmployee ? $a->getEmployee()->getShift()?->getName() : null,
        );
    }

    public function toArray(): array
    {
        $data = [
            'publicId' => $this->publicId,
            'date' => $this->date,
            'checkInAt' => $this->checkInAt,
            'checkOutAt' => $this->checkOutAt,
            'isLate' => $this->isLate,
            'leftEarly' => $this->leftEarly,
        ];

        if ($this->employeePublicId !== null) {
            $data['employeePublicId'] = $this->employeePublicId;
            $data['employeeName'] = $this->employeeName;
            $data['shiftName'] = $this->shiftName;
        }

        return $data;
    }
}

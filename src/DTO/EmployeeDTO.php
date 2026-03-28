<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\Employee;

final readonly class EmployeeDTO
{
    public function __construct(
        public string  $publicId,
        public string  $firstName,
        public string  $lastName,
        public string  $name,
        public ?string $phoneNumber,
        public bool    $active,
        public ?string $linkedUserPublicId,
        public ?string $linkedUserEmail,
        public ?string $shiftName,
        public ?string $shiftPublicId,
        public string  $createdAt,
    ) {}

    public static function fromEntity(Employee $e): self
    {
        return new self(
            publicId: (string) $e->getPublicId(),
            firstName: $e->getFirstName(),
            lastName: $e->getLastName(),
            name: $e->getName(),
            phoneNumber: $e->getPhoneNumber(),
            active: $e->isActive(),
            linkedUserPublicId: $e->getLinkedUser() ? (string) $e->getLinkedUser()->getPublicId() : null,
            linkedUserEmail: $e->getLinkedUser()?->getEmail(),
            shiftName: $e->getShift()?->getName(),
            shiftPublicId: $e->getShift() ? (string) $e->getShift()->getPublicId() : null,
            createdAt: $e->getCreatedAt()->format('c'),
        );
    }

    public function toArray(): array
    {
        return [
            'publicId' => $this->publicId,
            'firstName' => $this->firstName,
            'lastName' => $this->lastName,
            'name' => $this->name,
            'phoneNumber' => $this->phoneNumber,
            'active' => $this->active,
            'linkedUserPublicId' => $this->linkedUserPublicId,
            'linkedUserEmail' => $this->linkedUserEmail,
            'shiftName' => $this->shiftName,
            'shiftPublicId' => $this->shiftPublicId,
            'createdAt' => $this->createdAt,
        ];
    }
}

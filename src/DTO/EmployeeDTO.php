<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\Employee;

final readonly class EmployeeDTO
{
    public function __construct(
        public string  $publicId,
        public string  $qrToken,
        public string  $firstName,
        public string  $lastName,
        public string  $name,
        public ?string $username,
        public ?string $phoneNumber,
        public bool    $active,
        public ?string $linkedUserPublicId,
        public ?string $linkedUserEmail,
        public ?string $shiftName,
        public ?string $shiftPublicId,
        public ?string $dob,
        public ?string $joinedAt,
        public string  $createdAt,
    ) {}

    public static function fromEntity(Employee $e): self
    {
        return new self(
            publicId: (string) $e->getPublicId(),
            qrToken: $e->getQrToken(),
            firstName: $e->getFirstName(),
            lastName: $e->getLastName(),
            name: $e->getName(),
            username: $e->getUsername(),
            phoneNumber: $e->getPhoneNumber(),
            active: $e->isActive(),
            linkedUserPublicId: $e->getLinkedUser() ? (string) $e->getLinkedUser()->getPublicId() : null,
            linkedUserEmail: $e->getLinkedUser()?->getEmail(),
            shiftName: $e->getShift()?->getName(),
            shiftPublicId: $e->getShift() ? (string) $e->getShift()->getPublicId() : null,
            dob: $e->getDob()?->format('Y-m-d'),
            joinedAt: $e->getJoinedAt()?->format('Y-m-d'),
            createdAt: $e->getCreatedAt()->format('c'),
        );
    }

    public function toArray(): array
    {
        return [
            'publicId' => $this->publicId,
            'qrToken' => $this->qrToken,
            'firstName' => $this->firstName,
            'lastName' => $this->lastName,
            'name' => $this->name,
            'username' => $this->username,
            'phoneNumber' => $this->phoneNumber,
            'active' => $this->active,
            'linkedUserPublicId' => $this->linkedUserPublicId,
            'linkedUserEmail' => $this->linkedUserEmail,
            'shiftName' => $this->shiftName,
            'shiftPublicId' => $this->shiftPublicId,
            'dob' => $this->dob,
            'joinedAt' => $this->joinedAt,
            'createdAt' => $this->createdAt,
        ];
    }
}

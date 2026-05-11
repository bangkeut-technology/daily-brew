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
        public ?string $jobTitle,
        public ?string $username,
        public ?string $phoneNumber,
        public bool    $active,
        public string  $role,
        public ?string $linkedUserPublicId,
        public ?string $linkedUserEmail,
        public ?string $shiftName,
        public ?string $shiftPublicId,
        public ?string $dob,
        public ?string $joinedAt,
        public string  $createdAt,
        /** @var list<string> */
        public array   $managerPermissions,
        public string  $attendanceTracking,
    ) {}

    public static function fromEntity(Employee $e): self
    {
        return new self(
            publicId: (string) $e->getPublicId(),
            firstName: $e->getFirstName(),
            lastName: $e->getLastName(),
            name: $e->getName(),
            jobTitle: $e->getJobTitle(),
            username: $e->getUsername(),
            phoneNumber: $e->getPhoneNumber(),
            active: $e->isActive(),
            role: $e->getRole()->value,
            linkedUserPublicId: $e->getLinkedUser() ? (string) $e->getLinkedUser()->getPublicId() : null,
            linkedUserEmail: $e->getLinkedUser()?->getEmail(),
            shiftName: $e->getShift()?->getName(),
            shiftPublicId: $e->getShift() ? (string) $e->getShift()->getPublicId() : null,
            dob: $e->getDob()?->format('Y-m-d'),
            joinedAt: $e->getJoinedAt()?->format('Y-m-d'),
            createdAt: $e->getCreatedAt()->format('c'),
            managerPermissions: $e->getManagerPermissionValues(),
            attendanceTracking: $e->getAttendanceTracking()->value,
        );
    }

    public function toArray(): array
    {
        return [
            'publicId' => $this->publicId,
            'firstName' => $this->firstName,
            'lastName' => $this->lastName,
            'name' => $this->name,
            'jobTitle' => $this->jobTitle,
            'username' => $this->username,
            'phoneNumber' => $this->phoneNumber,
            'active' => $this->active,
            'role' => $this->role,
            'linkedUserPublicId' => $this->linkedUserPublicId,
            'linkedUserEmail' => $this->linkedUserEmail,
            'shiftName' => $this->shiftName,
            'shiftPublicId' => $this->shiftPublicId,
            'dob' => $this->dob,
            'joinedAt' => $this->joinedAt,
            'createdAt' => $this->createdAt,
            'managerPermissions' => $this->managerPermissions,
            'attendanceTracking' => $this->attendanceTracking,
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\User;

final readonly class UserDTO
{
    public function __construct(
        public string  $publicId,
        public ?string $email,
        public ?string $firstName,
        public ?string $lastName,
        public string  $fullName,
        public ?string $locale,
        public bool    $onboardingCompleted,
    ) {}

    public static function fromEntity(User $u): self
    {
        return new self(
            publicId: (string) $u->getPublicId(),
            email: $u->getEmail(),
            firstName: $u->getFirstName(),
            lastName: $u->getLastName(),
            fullName: $u->getFullName(),
            locale: $u->getLocale(),
            onboardingCompleted: $u->isOnboardingCompleted(),
        );
    }

    public function toArray(): array
    {
        return [
            'publicId' => $this->publicId,
            'email' => $this->email,
            'firstName' => $this->firstName,
            'lastName' => $this->lastName,
            'fullName' => $this->fullName,
            'locale' => $this->locale,
            'onboardingCompleted' => $this->onboardingCompleted,
        ];
    }
}

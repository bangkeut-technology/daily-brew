<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\User;
use App\Enum\UserRoleEnum;

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
        public ?string $currentWorkspacePublicId,
        public bool    $isSuperAdmin,
        public ?string $avatarUrl = null,
    ) {}

    /**
     * $avatarUrl is resolved by the caller via Vich's UploaderHelper — the DTO
     * has no DI and we don't want to inject Symfony services into a static
     * factory. Controllers that should surface the avatar pass it in; tests
     * and any pre-Vich call site can simply omit the argument.
     */
    public static function fromEntity(User $u, ?string $avatarUrl = null): self
    {
        return new self(
            publicId: (string) $u->getPublicId(),
            email: $u->getEmail(),
            firstName: $u->getFirstName(),
            lastName: $u->getLastName(),
            fullName: $u->getFullName(),
            locale: $u->getLocale(),
            onboardingCompleted: $u->isOnboardingCompleted(),
            currentWorkspacePublicId: $u->getCurrentWorkspace() ? (string) $u->getCurrentWorkspace()->getPublicId() : null,
            isSuperAdmin: $u->hasRole(UserRoleEnum::SUPER_ADMIN->value),
            avatarUrl: $avatarUrl,
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
            'currentWorkspacePublicId' => $this->currentWorkspacePublicId,
            'isSuperAdmin' => $this->isSuperAdmin,
            'avatarUrl' => $this->avatarUrl,
        ];
    }
}

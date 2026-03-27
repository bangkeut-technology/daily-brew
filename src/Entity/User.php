<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\OAuthProviderEnum;
use App\Enum\UserRoleEnum;
use App\Repository\UserRepository;
use DateTimeImmutable;
use Deprecated;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Serializable;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;
use Vich\UploaderBundle\Mapping\Attribute as Vich;

/**
 * Class User
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'daily_brew_users')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL_CANONICAL', fields: ['emailCanonical'])]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL_SECRET', fields: ['secret'])]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_APPLE_ID', fields: ['appleId'])]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_GOOGLE_ID', fields: ['googleId'])]
#[UniqueEntity(fields: ['emailCanonical'], message: 'There is already an account with this email')]
#[Vich\Uploadable]
#[ORM\HasLifecycleCallbacks]
class User extends AbstractBaseEntity implements UserInterface, PasswordAuthenticatedUserInterface, Serializable
{
    #[ORM\Column(length: 225)]
    private ?string $secret = null;

    #[ORM\Column(length: 180)]
    #[Groups(['user:read'])]
    private ?string $email = null;

    #[ORM\Column(name: 'email_canonical', length: 180)]
    #[Groups(['user:read'])]
    private ?string $emailCanonical = null;

    private ?string $plainPassword = null;

    /** @var array<int, string> */
    #[ORM\Column]
    #[Groups(['user:read'])]
    private array $roles = [UserRoleEnum::DEFAULT->value];

    #[ORM\Column(name: 'first_name', type: Types::STRING, length: 150, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $firstName = null;

    #[ORM\Column(name: 'last_name', type: Types::STRING, length: 150, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $lastName = null;

    #[ORM\Column(name: 'dob', type: Types::DATE_IMMUTABLE, nullable: true)]
    #[Groups(['user:read'])]
    private ?DateTimeImmutable $dob = null;

    #[Groups(['user:read'])]
    public ?string $avatarUrl = null;

    /** @var File|UploadedFile|null */
    #[Vich\UploadableField(
        mapping: 'users',
        fileNameProperty: 'imageName',
        size: 'fileSize',
        mimeType: 'mimeType',
        originalName: 'originalName',
        dimensions: 'dimensions'
    )]
    private UploadedFile|File|null $imageFile = null;

    #[ORM\Column(name: 'image_name', type: Types::STRING, length: 255, nullable: true)]
    private ?string $imageName = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $fileSize = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $originalName = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $mimeType = null;

    /** @var array<int, int>|null */
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $dimensions = null;

    #[ORM\Column(nullable: true)]
    private ?string $password = null;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['user:read'])]
    private bool $enabled = true;

    #[ORM\Column(length: 5, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $locale = 'en';

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(name: 'current_workspace_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    #[Groups(['user:read'])]
    private ?Workspace $currentWorkspace = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $appleId = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $googleId = null;

    /** Whether this user has completed the onboarding wizard. */
    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $onboardingCompleted = false;

    // ── Identity ───────────────────────────────────────────────

    public function getSecret(): ?string
    {
        return $this->secret;
    }

    public function setSecret(?string $secret): static
    {
        $this->secret = $secret;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getEmailCanonical(): ?string
    {
        return $this->emailCanonical;
    }

    public function setEmailCanonical(?string $emailCanonical): static
    {
        $this->emailCanonical = $emailCanonical;
        return $this;
    }

    // ── Password ───────────────────────────────────────────────

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): static
    {
        $this->plainPassword = $plainPassword;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function hasPassword(): bool
    {
        return (bool) $this->password;
    }

    #[Deprecated]
    public function eraseCredentials(): void
    {
        $this->plainPassword = null;
    }

    // ── Roles ──────────────────────────────────────────────────

    /** @return list<string> */
    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = UserRoleEnum::DEFAULT->value;
        return array_values(array_unique($roles));
    }

    public function setRoles(array $roles): static
    {
        $this->roles = [];
        foreach ($roles as $role) {
            $this->addRole($role);
        }
        return $this;
    }

    public function addRole(string $role): static
    {
        $role = strtoupper($role);
        if ($role === UserRoleEnum::DEFAULT->value) {
            return $this;
        }
        if (!in_array($role, $this->roles, true)) {
            $this->roles[] = $role;
        }
        return $this;
    }

    public function removeRole(string $role): static
    {
        if (false !== $key = array_search(strtoupper($role), $this->roles, true)) {
            unset($this->roles[$key]);
            $this->roles = array_values($this->roles);
        }
        return $this;
    }

    public function hasRole(string $role): bool
    {
        return in_array(strtoupper($role), $this->getRoles(), true);
    }

    public function setSuperAdmin(bool $true): static
    {
        if ($true) {
            $this->addRole(UserRoleEnum::SUPER_ADMIN->value);
        } else {
            $this->removeRole(UserRoleEnum::SUPER_ADMIN->value);
        }
        return $this;
    }

    // ── Profile ────────────────────────────────────────────────

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(?string $firstName): static
    {
        $this->firstName = $firstName;
        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(?string $lastName): static
    {
        $this->lastName = $lastName;
        return $this;
    }

    #[Groups(['user:read'])]
    public function getFullName(): string
    {
        return sprintf('%s %s', $this->firstName, $this->lastName);
    }

    public function getDob(): ?DateTimeImmutable
    {
        return $this->dob;
    }

    public function setDob(?DateTimeImmutable $dob): static
    {
        $this->dob = $dob;
        return $this;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    public function setAvatarUrl(?string $avatarUrl): static
    {
        $this->avatarUrl = $avatarUrl;
        return $this;
    }

    // ── Image upload ───────────────────────────────────────────

    public function getImageFile(): File|UploadedFile|null
    {
        return $this->imageFile;
    }

    public function setImageFile(File|UploadedFile|null $imageFile): static
    {
        $this->imageFile = $imageFile;
        return $this;
    }

    public function getImageName(): ?string
    {
        return $this->imageName;
    }

    public function setImageName(?string $imageName): static
    {
        $this->imageName = $imageName;
        return $this;
    }

    public function getFileSize(): ?int
    {
        return $this->fileSize;
    }

    public function setFileSize(?int $fileSize): static
    {
        $this->fileSize = $fileSize;
        return $this;
    }

    public function getOriginalName(): ?string
    {
        return $this->originalName;
    }

    public function setOriginalName(?string $originalName): static
    {
        $this->originalName = $originalName;
        return $this;
    }

    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    public function setMimeType(?string $mimeType): static
    {
        $this->mimeType = $mimeType;
        return $this;
    }

    public function getDimensions(): ?array
    {
        return $this->dimensions;
    }

    public function setDimensions(?array $dimensions): static
    {
        $this->dimensions = $dimensions;
        return $this;
    }

    // ── Status ─────────────────────────────────────────────────

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): static
    {
        $this->enabled = $enabled;
        return $this;
    }

    public function getLocale(): ?string
    {
        return $this->locale ?? 'en';
    }

    public function setLocale(?string $locale): static
    {
        $this->locale = $locale;
        return $this;
    }

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?DateTimeImmutable $deletedAt): static
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    // ── Workspace ──────────────────────────────────────────────

    public function getCurrentWorkspace(): ?Workspace
    {
        return $this->currentWorkspace;
    }

    public function setCurrentWorkspace(?Workspace $currentWorkspace): static
    {
        $this->currentWorkspace = $currentWorkspace;
        return $this;
    }

    // ── Onboarding ─────────────────────────────────────────────

    public function isOnboardingCompleted(): bool
    {
        return $this->onboardingCompleted;
    }

    public function setOnboardingCompleted(bool $onboardingCompleted): static
    {
        $this->onboardingCompleted = $onboardingCompleted;
        return $this;
    }

    // ── OAuth ──────────────────────────────────────────────────

    public function getAppleId(): ?string
    {
        return $this->appleId;
    }

    public function setAppleId(?string $appleId): static
    {
        $this->appleId = $appleId;
        return $this;
    }

    public function getGoogleId(): ?string
    {
        return $this->googleId;
    }

    public function setGoogleId(?string $googleId): static
    {
        $this->googleId = $googleId;
        return $this;
    }

    public function linkOAuth(OAuthProviderEnum $provider, string $providerId): static
    {
        return match ($provider) {
            OAuthProviderEnum::APPLE => $this->setAppleId($providerId),
            OAuthProviderEnum::GOOGLE => $this->setGoogleId($providerId),
        };
    }

    public function hasOAuth(OAuthProviderEnum $provider): bool
    {
        return match ($provider) {
            OAuthProviderEnum::APPLE => $this->getAppleId() !== null,
            OAuthProviderEnum::GOOGLE => $this->getGoogleId() !== null,
        };
    }

    public function unlinkOAuth(OAuthProviderEnum $provider): static
    {
        return match ($provider) {
            OAuthProviderEnum::APPLE => $this->setAppleId(null),
            OAuthProviderEnum::GOOGLE => $this->setGoogleId(null),
        };
    }

    // ── Serialization ──────────────────────────────────────────

    #[ORM\PrePersist]
    public function generateSecret(): void
    {
        $this->secret = Uuid::v4()->toBase58();
    }

    public function __serialize(): array
    {
        return [
            $this->password,
            $this->emailCanonical,
            $this->email,
            $this->enabled,
            $this->firstName,
            $this->lastName,
            $this->id,
        ];
    }

    /** @param list<mixed> $data */
    public function __unserialize(array $data): void
    {
        if (13 === count($data)) {
            unset($data[4], $data[5], $data[6], $data[9], $data[10]);
            $data = array_values($data);
        } elseif (11 === count($data)) {
            unset($data[4], $data[7], $data[8]);
            $data = array_values($data);
        }

        [
            $this->password,
            $this->emailCanonical,
            $this->email,
            $this->enabled,
            $this->firstName,
            $this->lastName,
            $this->id,
        ] = $data;
    }

    final public function serialize(): ?string
    {
        return serialize($this->__serialize());
    }

    final public function unserialize($data): void
    {
        $this->__unserialize(unserialize($data));
    }

    public function __toString(): string
    {
        return (string) $this->getEmail();
    }
}

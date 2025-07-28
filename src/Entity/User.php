<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\RoleEnum;
use App\Repository\UserRepository;
use DateTimeImmutable;
use Deprecated;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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
use Vich\UploaderBundle\Mapping\Annotation as Vich;

/**
 * Class User.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'daily_brew_users')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL_CANONICAL', fields: ['emailCanonical'])]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL_SECRET', fields: ['secret'])]
#[UniqueEntity(fields: ['emailCanonical'], message: 'There is already an account with this emailCanonical')]
#[Vich\Uploadable]
class User extends AbstractEntity implements UserInterface, PasswordAuthenticatedUserInterface, Serializable
{
    #[ORM\Column(length: 225)]
    private ?Uuid $secret = null;

    #[ORM\Column(length: 180)]
    #[Groups(['user:read'])]
    private ?string $email = null;

    #[ORM\Column(name: 'email_canonical', length: 180)]
    #[Groups(['user:read'])]
    private ?string $emailCanonical = null;

    private ?string $plainPassword = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups(['user:read'])]
    private array $roles = [RoleEnum::DEFAULT->value];

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

    /**
     * @var array<int, int>
     */
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $dimensions = null;

    /**
     * @var string|null The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['user:read'])]
    private bool $enabled = true;

    #[ORM\Column(length: 5, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $locale = 'en';

    /**
     * @var Collection<int, EvaluationCriteria>
     */
    #[ORM\OneToMany(targetEntity: EvaluationCriteria::class, mappedBy: 'user', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $criterias;

    /**
     * @var Collection<int, Store>
     */
    #[ORM\OneToMany(targetEntity: Store::class, mappedBy: 'user', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $stores;

    /**
     * @var Collection<int, EvaluationTemplate>
     */
    #[ORM\OneToMany(targetEntity: EvaluationTemplate::class, mappedBy: 'user', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $templates;

    public function __construct()
    {
        $this->criterias = new ArrayCollection();
        $this->stores = new ArrayCollection();
        $this->templates = new ArrayCollection();
    }

    public function getSecret(): ?Uuid
    {
        return $this->secret;
    }

    public function setSecret(?Uuid $secret): User
    {
        $this->secret = $secret;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    /**
     * @return $this
     */
    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @return list<string>
     *
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = RoleEnum::DEFAULT->value;

        return array_values(array_unique($roles));
    }

    /**
     * Sets the roles for this user.
     *
     * @param array $roles An array of roles
     *
     * @return static The updated instance of the class
     */
    public function setRoles(array $roles): static
    {
        $this->roles = [];

        foreach ($roles as $role) {
            $this->addRole($role);
        }

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    /**
     * @return $this
     */
    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    #[Deprecated]
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        $this->plainPassword = null;
    }

    public function getEmailCanonical(): ?string
    {
        return $this->emailCanonical;
    }

    /**
     * @return $this
     */
    public function setEmailCanonical(?string $emailCanonical): User
    {
        $this->emailCanonical = $emailCanonical;

        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    /**
     * @return $this
     */
    public function setPlainPassword(?string $plainPassword): User
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(?string $firstName): User
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(?string $lastName): User
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getDob(): ?DateTimeImmutable
    {
        return $this->dob;
    }

    public function setDob(?DateTimeImmutable $dob): User
    {
        $this->dob = $dob;

        return $this;
    }

    public function getImageFile(): File|UploadedFile|null
    {
        return $this->imageFile;
    }

    public function setImageFile(File|UploadedFile|null $imageFile): User
    {
        $this->imageFile = $imageFile;

        if (null !== $imageFile) {
            $this->updatedAt = new DateTimeImmutable();
        }

        return $this;
    }

    public function getImageName(): ?string
    {
        return $this->imageName;
    }

    public function setImageName(?string $imageName): User
    {
        $this->imageName = $imageName;

        return $this;
    }

    public function getFileSize(): ?int
    {
        return $this->fileSize;
    }

    public function setFileSize(?int $fileSize): User
    {
        $this->fileSize = $fileSize;

        return $this;
    }

    public function getOriginalName(): ?string
    {
        return $this->originalName;
    }

    public function setOriginalName(?string $originalName): User
    {
        $this->originalName = $originalName;

        return $this;
    }

    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    public function setMimeType(?string $mimeType): User
    {
        $this->mimeType = $mimeType;

        return $this;
    }

    public function getDimensions(): ?array
    {
        return $this->dimensions;
    }

    public function setDimensions(?array $dimensions): User
    {
        $this->dimensions = $dimensions;

        return $this;
    }

    public function getFullName(): string
    {
        return sprintf('%s %s', $this->firstName, $this->lastName);
    }

    /**
     * Checks if the user has a specific role.
     *
     * @param string $role The role to check
     *
     * @return bool true if the user has the role, false otherwise
     */
    public function hasRole(string $role): bool
    {
        return in_array(strtoupper($role), $this->getRoles(), true);
    }

    /**
     * Adds a role to the list of roles associated with this user.
     *
     * @param string $role The role to add
     *
     * @return static The updated instance of the class
     */
    public function addRole(string $role): static
    {
        $role = strtoupper($role);
        if ($role === RoleEnum::DEFAULT->value) {
            return $this;
        }

        if (!in_array($role, $this->roles, true)) {
            $this->roles[] = $role;
        }

        return $this;
    }

    /**
     * Removes a role from the list of roles associated with this user.
     *
     * @param string $role The role to remove
     *
     * @return static The updated instance of the class
     */
    public function removeRole(string $role): static
    {
        if (false !== $key = array_search(strtoupper($role), $this->roles, true)) {
            unset($this->roles[$key]);
            $this->roles = array_values($this->roles);
        }

        return $this;
    }

    /**
     * Returns the enabled status of the user.
     *
     * @return bool The enabled status of the user
     */
    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    /**
     * Sets the enabled status of the application.
     *
     * @param bool $enabled The enabled status of the application
     *
     * @return static The updated instance of the class
     */
    public function setEnabled(bool $enabled): static
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getLocale(): ?string
    {
        return $this->locale ?? 'en';
    }

    /**
     * @param string|null $locale
     * @return User
     */
    public function setLocale(?string $locale): static
    {
        $this->locale = $locale;

        return $this;
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return (string) $this->getEmail();
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

    /**
     * @param list<mixed> $data
     */
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

    /**
     * @internal
     */
    final public function serialize(): ?string
    {
        return serialize($this->__serialize());
    }

    /**
     * @internal
     */
    final public function unserialize($data): void
    {
        $this->__unserialize(unserialize($data));
    }

    /**
     * Sets the user as a super admin.
     *
     * @param bool $true if true, the user will be set as a super admin; if false, the super admin role will be removed
     *
     * @return static The updated instance of the class
     */
    public function setSuperAdmin(bool $true): static
    {
        if ($true) {
            $this->addRole(RoleEnum::SUPER_ADMIN->value);
        } else {
            $this->removeRole(RoleEnum::SUPER_ADMIN->value);
        }

        return $this;
    }

    /**
     * @return Collection<int, EvaluationCriteria>
     */
    public function getCriterias(): Collection
    {
        return $this->criterias;
    }

    public function addCriteria(EvaluationCriteria $criteria): User
    {
        if (!$this->criterias->contains($criteria)) {
            $this->criterias->add($criteria);
            $criteria->setUser($this);
        }

        return $this;
    }

    public function removeCriteria(EvaluationCriteria $criteria): User
    {
        if ($this->criterias->removeElement($criteria) && $criteria->getUser() === $this) {
            $criteria->setUser(null);
        }

        return $this;
    }

    /**
     * @return Collection<int, Store>
     */
    public function getStores(): Collection
    {
        return $this->stores;
    }

    public function addStore(Store $store): User
    {
        if (!$this->stores->contains($store)) {
            $this->stores->add($store);
            $store->setUser($this);
        }

        return $this;
    }

    public function removeStore(Store $store): User
    {
        if ($this->stores->removeElement($store) && $store->getUser() === $this) {
            $store->setUser(null);
        }

        return $this;
    }

    /**
     * @return Collection<int, EvaluationTemplate>
     */
    public function getTemplates(): Collection
    {
        return $this->templates;
    }

    public function addTemplate(EvaluationTemplate $template): User
    {
        if (!$this->templates->contains($template)) {
            $this->templates->add($template);
            $template->setUser($this);
        }

        return $this;
    }

    public function removeTemplate(EvaluationTemplate $template): User
    {
        if ($this->templates->removeElement($template) && $template->getUser() === $this) {
            $template->setUser(null);
        }

        return $this;
    }

    /**
     * Automatically sets the secret UUID before persisting the user.
     */
    #[ORM\PrePersist]
    public function prePersist(): void
    {
        parent::prePersist();
        $this->secret = Uuid::v4();
    }
}

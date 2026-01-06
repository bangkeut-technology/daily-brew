<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\UserRoleEnum;
use App\Repository\UserRepository;
use DateTimeImmutable;
use Deprecated;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use LogicException;
use Scheb\TwoFactorBundle\Model\Email\TwoFactorInterface;
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
#[UniqueEntity(fields: ['emailCanonical'], message: 'There is already a workspace with this emailCanonical')]
#[Vich\Uploadable]
#[ORM\HasLifecycleCallbacks]
class User extends AbstractEntity implements UserInterface, PasswordAuthenticatedUserInterface, Serializable, TwoFactorInterface
{
    /**
     * The unique identifier of the user.
     * While this is not a primary key, it is used to uniquely identify the user.
     * This is used for various operations such as authentication and authorization.
     * @var string|null
     */
    #[ORM\Column(length: 225)]
    private ?string $secret = null;

    /**
     * The email address of the user.
     * This is used as the unique identifier for the user.
     * @var string|null
     */
    #[ORM\Column(length: 180)]
    #[Groups(['user:read'])]
    private ?string $email = null;

    /**
     * The canonical version of the email address.
     * This is used to ensure that the email address is unique and case-insensitive.
     * @var string|null
     */
    #[ORM\Column(name: 'email_canonical', length: 180)]
    #[Groups(['user:read'])]
    private ?string $emailCanonical = null;

    /**
     * The plain password of the user.
     * This is used for validation and should not be stored in the database.
     *
     * @var string|null
     */
    private ?string $plainPassword = null;

    /**
     * The roles assigned to the user.
     * This is used for authorization to determine what actions the user can perform.
     * @var array<int, string>
     */
    #[ORM\Column]
    #[Groups(['user:read'])]
    private array $roles = [UserRoleEnum::DEFAULT->value];

    /**
     * The first name of the user.
     * This is used for display and can be null if not provided.
     *
     * @var string|null
     */
    #[ORM\Column(name: 'first_name', type: Types::STRING, length: 150, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $firstName = null;

    /**
     * The last name of the user.
     * This is used for display and can be null if not provided.
     *
     * @var string|null
     */
    #[ORM\Column(name: 'last_name', type: Types::STRING, length: 150, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $lastName = null;

    /**
     * The date of birth of the user.
     * This is used for display and can be null if not provided.
     *
     * @var DateTimeImmutable|null
     */
    #[ORM\Column(name: 'dob', type: Types::DATE_IMMUTABLE, nullable: true)]
    #[Groups(['user:read'])]
    private ?DateTimeImmutable $dob = null;

    /**
     * The URL of the user's avatar.
     * This is used for display and can be null if not provided.
     *
     * @var string|null
     */
    #[Groups(['user:read'])]
    public ?string $avatarUrl = null;

    /**
     * The file associated with the user's image.
     * This is used for uploading and storing the user's profile image.
     *
     * @var File|UploadedFile|null
     */
    #[Vich\UploadableField(
        mapping: 'users',
        fileNameProperty: 'imageName',
        size: 'fileSize',
        mimeType: 'mimeType',
        originalName: 'originalName',
        dimensions: 'dimensions'
    )]
    private UploadedFile|File|null $imageFile = null;

    /**
     * The name of the image file.
     * This is used to store the name of the uploaded image file.
     *
     * @var string|null
     */
    #[ORM\Column(name: 'image_name', type: Types::STRING, length: 255, nullable: true)]
    private ?string $imageName = null;

    /**
     * The size of the uploaded file in bytes.
     * This is used to store the size of the uploaded image file.
     *
     * @var int|null
     */
    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $fileSize = null;

    /**
     * The original name of the uploaded file.
     * This is used to store the original name of the file before it was uploaded.
     *
     * @var string|null
     */
    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $originalName = null;

    /**
     * The MIME type of the uploaded file.
     * This is used to store the MIME type of the uploaded image file.
     *
     * @var string|null
     */
    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $mimeType = null;

    /**
     * The dimensions of the uploaded image.
     * This is used to store the width and height of the uploaded image file.
     *
     * @var array<int, int>
     */
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $dimensions = null;

    /**
     * The password of the user.
     * This is used for authentication and should be stored securely.
     *
     * @var string|null The hashed password of the user.
     */
    #[ORM\Column]
    private ?string $password = null;

    /**
     * The enabled status of the user.
     * This indicates whether the user workspace is active or not.
     *
     * @var bool
     */
    #[ORM\Column(type: 'boolean')]
    #[Groups(['user:read'])]
    private bool $enabled = true;

    /**
     * The locale of the user.
     * This is used to determine the language and regional settings for the user.
     *
     * @var string|null
     */
    #[ORM\Column(length: 5, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $locale = 'en';

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

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

    /**
     * @var Collection<int, EvaluationTemplate>
     */
    #[ORM\OneToMany(targetEntity: Role::class, mappedBy: 'user', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $employeeRoles;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $authCode;

    /**
     * @var Collection<int, WorkspaceUser>
     */
    #[ORM\OneToMany(targetEntity: WorkspaceUser::class, mappedBy: 'user')]
    private Collection $workspaces;

    #[ORM\ManyToOne(targetEntity: WorkspaceUser::class)]
    #[ORM\JoinColumn(name: 'current_workspace_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?Workspace $currentWorkspace = null;

    public function __construct()
    {
        $this->criterias = new ArrayCollection();
        $this->stores = new ArrayCollection();
        $this->templates = new ArrayCollection();
        $this->employeeRoles = new ArrayCollection();
        $this->workspaces = new ArrayCollection();
    }

    /**
     * @return string|null
     */
    public function getSecret(): ?string
    {
        return $this->secret;
    }

    /**
     * @param string|null $secret
     * @return User
     */
    public function setSecret(?string $secret): User
    {
        $this->secret = $secret;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getEmail(): ?string
    {
        return $this->email;
    }

    /**
     * @param string|null $email
     * @return User
     */
    public function setEmail(?string $email): User
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
        $roles[] = UserRoleEnum::DEFAULT->value;

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

    /**
     * @return string|null
     */
    public function getEmailCanonical(): ?string
    {
        return $this->emailCanonical;
    }

    /**
     * @param string|null $emailCanonical
     * @return User
     */
    public function setEmailCanonical(?string $emailCanonical): User
    {
        $this->emailCanonical = $emailCanonical;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    /**
     * @param string|null $plainPassword
     * @return User
     */
    public function setPlainPassword(?string $plainPassword): User
    {
        $this->plainPassword = $plainPassword;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    /**
     * @param string|null $firstName
     * @return User
     */
    public function setFirstName(?string $firstName): User
    {
        $this->firstName = $firstName;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    /**
     * @param string|null $lastName
     * @return User
     */
    public function setLastName(?string $lastName): User
    {
        $this->lastName = $lastName;
        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getDob(): ?DateTimeImmutable
    {
        return $this->dob;
    }

    /**
     * @param DateTimeImmutable|null $dob
     * @return User
     */
    public function setDob(?DateTimeImmutable $dob): User
    {
        $this->dob = $dob;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    /**
     * @param string|null $avatarUrl
     * @return User
     */
    public function setAvatarUrl(?string $avatarUrl): User
    {
        $this->avatarUrl = $avatarUrl;
        return $this;
    }

    /**
     * @return File|UploadedFile|null
     */
    public function getImageFile(): File|UploadedFile|null
    {
        return $this->imageFile;
    }

    /**
     * @param File|UploadedFile|null $imageFile
     * @return User
     */
    public function setImageFile(File|UploadedFile|null $imageFile): User
    {
        $this->imageFile = $imageFile;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getImageName(): ?string
    {
        return $this->imageName;
    }

    /**
     * @param string|null $imageName
     * @return User
     */
    public function setImageName(?string $imageName): User
    {
        $this->imageName = $imageName;
        return $this;
    }

    /**
     * @return int|null
     */
    public function getFileSize(): ?int
    {
        return $this->fileSize;
    }

    /**
     * @param int|null $fileSize
     * @return User
     */
    public function setFileSize(?int $fileSize): User
    {
        $this->fileSize = $fileSize;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getOriginalName(): ?string
    {
        return $this->originalName;
    }

    /**
     * @param string|null $originalName
     * @return User
     */
    public function setOriginalName(?string $originalName): User
    {
        $this->originalName = $originalName;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    /**
     * @param string|null $mimeType
     * @return User
     */
    public function setMimeType(?string $mimeType): User
    {
        $this->mimeType = $mimeType;
        return $this;
    }

    /**
     * @return array|null
     */
    public function getDimensions(): ?array
    {
        return $this->dimensions;
    }

    /**
     * @param array|null $dimensions
     * @return User
     */
    public function setDimensions(?array $dimensions): User
    {
        $this->dimensions = $dimensions;
        return $this;
    }

    /**
     * Returns the full name of the user.
     *
     * @return string The full name in the format "FirstName LastName"
     */
    #[Groups(['user:read'])]
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
        if ($role === UserRoleEnum::DEFAULT->value) {
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

    /**
     * Returns the locale of the user.
     *
     * @return string|null The locale of the user, or 'en' if not set
     */
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
            $this->addRole(UserRoleEnum::SUPER_ADMIN->value);
        } else {
            $this->removeRole(UserRoleEnum::SUPER_ADMIN->value);
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

    /**
     * @param Collection<int, Store> $stores
     * @return User
     */
    public function setStores(Collection $stores): User
    {
        $this->stores = $stores;
        return $this;
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
     * @return Collection<int, Role>
     */
    public function getEmployeeRoles(): Collection
    {
        return $this->employeeRoles;
    }

    public function addEmployeeRole(Role $role): User
    {
        if (!$this->employeeRoles->contains($role)) {
            $this->employeeRoles->add($role);
            $role->setUser($this);
        }

        return $this;
    }

    public function removeEmployeeRole(Role $role): User
    {
        if ($this->employeeRoles->removeElement($role) && $role->getUser() === $this) {
            $role->setUser(null);
        }

        return $this;
    }

    /**
     * Automatically sets the secret UUID before persisting the user.
     */
    #[ORM\PrePersist]
    public function generateSecret(): void
    {
        $this->secret = Uuid::v4()->toBase58();
    }

    public function isEmailAuthEnabled(): bool
    {
        return true;
    }

    public function getEmailAuthRecipient(): string
    {
        return $this->email;
    }

    public function getEmailAuthCode(): string
    {
        return null === $this->authCode ? throw new LogicException('The email authentication code was not set') : $this->authCode;

    }

    /**
     * @param string $authCode
     * @return void
     */
    public function setEmailAuthCode(string $authCode): void
    {
        $this->authCode = $authCode;
    }

    /**
     * @return Collection<int, WorkspaceUser>
     */
    public function getWorkspaces(): Collection
    {
        return $this->workspaces;
    }

    public function addWorkspace(WorkspaceUser $workspace): static
    {
        if (!$this->workspaces->contains($workspace)) {
            $this->workspaces->add($workspace);
            $workspace->setUser($this);
        }

        return $this;
    }

    public function removeWorkspace(WorkspaceUser $workspace): static
    {
        if ($this->workspaces->removeElement($workspace) && $workspace->getUser() === $this) {
            $workspace->setUser(null);
        }

        return $this;
    }

    public function getCurrentWorkspace(): ?Workspace
    {
        return $this->currentWorkspace;
    }

    public function setCurrentWorkspace(?Workspace $currentWorkspace): static
    {
        $this->currentWorkspace = $currentWorkspace;

        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    /**
     * @param DateTimeImmutable|null $deletedAt
     *
     * @return User
     */
    public function setDeletedAt(?DateTimeImmutable $deletedAt): User
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }
}

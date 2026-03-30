<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\EmployeeStatusEnum;
use App\Repository\EmployeeRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class Employee
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_employees')]
#[ORM\UniqueConstraint(name: 'unique_linked_user_workspace', columns: ['linked_user_id', 'workspace_id'])]
#[ORM\Entity(repositoryClass: EmployeeRepository::class)]
class Employee extends AbstractBaseEntity
{
    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['employee:read'])]
    private string $firstName;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['employee:read'])]
    private string $lastName;

    #[ORM\Column(length: 200, nullable: true)]
    private ?string $nameCanonical = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['employee:read'])]
    private ?string $phoneNumber = null;

    /** Unique username for cross-product staff linking (e.g. BasilBook). */
    #[ORM\Column(length: 50, nullable: true, unique: true)]
    #[Groups(['employee:read'])]
    private ?string $username = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['employee:read'])]
    private ?DateTimeImmutable $dob = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['employee:read'])]
    private ?DateTimeImmutable $joinedAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    #[ORM\Column(type: 'string', enumType: EmployeeStatusEnum::class)]
    #[Groups(['employee:read'])]
    private EmployeeStatusEnum $status = EmployeeStatusEnum::ACTIVE;

    /** The user who created this employee (workspace owner). */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['employee:read'])]
    private ?User $user = null;

    /** Linked user account — allows employee to log in and see their own data. */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['employee:read'])]
    private ?User $linkedUser = null;

    #[ORM\ManyToOne(inversedBy: 'employees')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    #[ORM\ManyToOne(targetEntity: Shift::class, inversedBy: 'employees')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Shift $shift = null;

    /** @var Collection<int, Attendance> */
    #[ORM\OneToMany(targetEntity: Attendance::class, mappedBy: 'employee', orphanRemoval: true)]
    private Collection $attendances;

    public function __construct()
    {
        parent::__construct();
        $this->attendances = new ArrayCollection();
    }

    // ── Name ───────────────────────────────────────────────────

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;
        return $this;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;
        return $this;
    }

    /** Convenience — used by services/controllers expecting a single name. */
    #[Groups(['employee:read'])]
    public function getName(): string
    {
        return trim($this->firstName . ' ' . $this->lastName);
    }

    #[Groups(['employee:read'])]
    public function getFullName(): string
    {
        return $this->getName();
    }

    public function getNameCanonical(): ?string
    {
        return $this->nameCanonical;
    }

    public function setNameCanonical(?string $nameCanonical): static
    {
        $this->nameCanonical = $nameCanonical;
        return $this;
    }

    // ── Contact / Details ──────────────────────────────────────

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(?string $username): static
    {
        $this->username = $username;
        return $this;
    }

    public function getPhoneNumber(): ?string
    {
        return $this->phoneNumber;
    }

    public function setPhoneNumber(?string $phoneNumber): static
    {
        $this->phoneNumber = $phoneNumber;
        return $this;
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

    public function getJoinedAt(): ?DateTimeImmutable
    {
        return $this->joinedAt;
    }

    public function setJoinedAt(?DateTimeImmutable $joinedAt): static
    {
        $this->joinedAt = $joinedAt;
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

    // ── Status ─────────────────────────────────────────────────

    public function getStatus(): EmployeeStatusEnum
    {
        return $this->status;
    }

    public function setStatus(EmployeeStatusEnum $status): static
    {
        $this->status = $status;
        return $this;
    }

    /** Convenience for CheckinService / controllers. */
    public function isActive(): bool
    {
        return $this->status === EmployeeStatusEnum::ACTIVE;
    }

    // ── Relations ──────────────────────────────────────────────

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getLinkedUser(): ?User
    {
        return $this->linkedUser;
    }

    public function setLinkedUser(?User $linkedUser): static
    {
        $this->linkedUser = $linkedUser;
        return $this;
    }

    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(?Workspace $workspace): static
    {
        $this->workspace = $workspace;
        return $this;
    }

    public function getShift(): ?Shift
    {
        return $this->shift;
    }

    public function setShift(?Shift $shift): static
    {
        $this->shift = $shift;
        return $this;
    }

    /** @return Collection<int, Attendance> */
    public function getAttendances(): Collection
    {
        return $this->attendances;
    }

    public function __toString(): string
    {
        return $this->getName();
    }
}

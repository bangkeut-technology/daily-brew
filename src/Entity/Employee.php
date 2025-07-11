<?php
declare(strict_types=1);

namespace App\Entity;

use App\Enum\EmployeeStatus;
use App\Repository\EmployeeRepository;
use DateTimeImmutable;
use DateTimeInterface;
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
#[ORM\Entity(repositoryClass: EmployeeRepository::class)]
#[ORM\UniqueConstraint(name: 'UNQ_EMPLOYEE_IDENTIFIER', columns: ['identifier'])]
class Employee extends AbstractEntity
{
    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    private string $firstName;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    private string $lastName;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $phoneNumber = null;

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $dob = null;

    #[ORM\Column]
    #[Assert\NotNull]
    private ?DateTimeImmutable $joinedAt = null;

    #[ORM\Column(type: 'string', enumType: EmployeeStatus::class)]
    private EmployeeStatus $status = EmployeeStatus::ACTIVE;

    /**
     * @var string|null
     */
    #[ORM\Column(length: 32)]
    #[Groups(['employee:read'])]
    private ?string $identifier = null;

    /**
     * @var Store|null
     */
    #[ORM\ManyToOne(targetEntity: Store::class, inversedBy: 'employees')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Store $store = null;

    /**
     * @var User|null
     */
    #[ORM\OneToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['employee:read'])]
    private ?User $user = null;

    /**
     * @return string
     */
    public function getFirstName(): string
    {
        return $this->firstName;
    }

    /**
     * @param string $firstName
     * @return Employee
     */
    public function setFirstName(string $firstName): Employee
    {
        $this->firstName = $firstName;
        return $this;
    }

    /**
     * @return string
     */
    public function getLastName(): string
    {
        return $this->lastName;
    }

    /**
     * @param string $lastName
     * @return Employee
     */
    public function setLastName(string $lastName): Employee
    {
        $this->lastName = $lastName;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getPhoneNumber(): ?string
    {
        return $this->phoneNumber;
    }

    /**
     * @param string|null $phoneNumber
     * @return Employee
     */
    public function setPhoneNumber(?string $phoneNumber): Employee
    {
        $this->phoneNumber = $phoneNumber;
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
     * @return Employee
     */
    public function setDob(?DateTimeImmutable $dob): Employee
    {
        $this->dob = $dob;
        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getJoinedAt(): ?DateTimeImmutable
    {
        return $this->joinedAt;
    }

    /**
     * @param DateTimeImmutable|null $joinedAt
     * @return Employee
     */
    public function setJoinedAt(?DateTimeImmutable $joinedAt): Employee
    {
        $this->joinedAt = $joinedAt;
        return $this;
    }

    /**
     * @return EmployeeStatus
     */
    public function getStatus(): EmployeeStatus
    {
        return $this->status;
    }

    /**
     * @param EmployeeStatus $status
     * @return Employee
     */
    public function setStatus(EmployeeStatus $status): Employee
    {
        $this->status = $status;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getIdentifier(): ?string
    {
        return $this->identifier;
    }

    /**
     * @param string|null $identifier
     * @return Employee
     */
    public function setIdentifier(?string $identifier): Employee
    {
        $this->identifier = $identifier;
        return $this;
    }

    /**
     * @return Store|null
     */
    public function getStore(): ?Store
    {
        return $this->store;
    }

    /**
     * @param Store|null $store
     * @return Employee
     */
    public function setStore(?Store $store): Employee
    {
        $this->store = $store;
        return $this;
    }

    /**
     * @return User|null
     */
    public function getUser(): ?User
    {
        return $this->user;
    }

    /**
     * @param User|null $user
     * @return Employee
     */
    public function setUser(?User $user): Employee
    {
        $this->user = $user;
        return $this;
    }
}

<?php
declare(strict_types=1);

namespace App\Entity;

use App\Repository\StoreRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class Store
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_stores')]
#[ORM\Entity(repositoryClass: StoreRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_STORE_NAME', fields: ['name', 'user'])]
#[ORM\UniqueConstraint(name: 'UNIQ_STORE_CANONICAL_NAME', fields: ['canonicalName', 'user'])]
#[ORM\UniqueConstraint(name: 'UNIQ_STORE_IDENTIFIER', fields: ['identifier'])]
class Store extends AbstractEntity
{
    /**
     * @var string|null
     */
    #[ORM\Column(length: 255)]
    #[Groups(['store:read'])]
    #[Assert\NotBlank]
    private ?string $name = null;

    /**
     * @var string|null
     */
    #[ORM\Column(length: 255)]
    #[Groups(['store:read'])]
    private ?string $canonicalName = null;

    /**
     * @var string|null
     */
    #[ORM\Column(length: 32)]
    #[Groups(['store:read'])]
    private ?string $identifier = null;

    /**
     * @var User|null
     */
    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'stores')]
    private ?User $user = null;


    #[ORM\OneToMany(targetEntity: Employee::class, mappedBy: 'store', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $employees;

    public function __construct()
    {
        $this->employees = new ArrayCollection();
    }

    /**
     * @return string|null
     */
    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * @param string|null $name
     * @return Store
     */
    public function setName(?string $name): Store
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getCanonicalName(): ?string
    {
        return $this->canonicalName;
    }

    /**
     * @param string|null $canonicalName
     * @return Store
     */
    public function setCanonicalName(?string $canonicalName): Store
    {
        $this->canonicalName = $canonicalName;
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
     * @return Store
     */
    public function setIdentifier(?string $identifier): Store
    {
        $this->identifier = $identifier;
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
     * @return Store
     */
    public function setUser(?User $user): Store
    {
        $this->user = $user;
        return $this;
    }

    /**
     * @return Collection<int, Employee>
     */
    public function getEmployees(): Collection
    {
        return $this->employees;
    }

    public function addEmployee(Employee $employee): static
    {
        if (!$this->employees->contains($employee)) {
            $this->employees->add($employee);
            $employee->setStore($this);
        }

        return $this;
    }

    public function removeEmployee(Employee $employee): static
    {
        if ($this->employees->removeElement($employee) && $employee->getStore() === $this) {
            $employee->setStore(null);
        }

        return $this;
    }

    public function __toString(): string
    {
        return $this->name ?? '';
    }
}

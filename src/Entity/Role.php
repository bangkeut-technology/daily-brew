<?php
declare(strict_types=1);

namespace App\Entity;

use App\Repository\RoleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class Role
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_roles')]
#[ORM\Entity(repositoryClass: RoleRepository::class)]
#[ORM\UniqueConstraint(name: 'UNQ_ROLE_NAME', columns: ['name'])]
#[ORM\UniqueConstraint(name: 'UNQ_ROLE_NAME_CANONICAL', columns: ['canonical_name'])]
class Role extends AbstractEntity
{
    /**
     * @var string|null
     */
    #[ORM\Column(length: 100)]
    #[Groups(['role:read'])]
    private ?string $name = null;

    /**
     * @var string|null
     */
    #[ORM\Column(length: 100)]
    #[Groups(['role:read'])]
    private ?string $canonicalName = null;

    /**
     * @var string|null
     */
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['role:read'])]
    private ?string $description = null;

    /**
     * @var Collection<int, Employee>
     */
    #[ORM\ManyToMany(targetEntity: Employee::class, mappedBy: 'roles')]
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
     * @return Role
     */
    public function setName(?string $name): Role
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
     * @return Role
     */
    public function setCanonicalName(?string $canonicalName): Role
    {
        $this->canonicalName = $canonicalName;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getDescription(): ?string
    {
        return $this->description;
    }

    /**
     * @param string|null $description
     * @return Role
     */
    public function setDescription(?string $description): Role
    {
        $this->description = $description;
        return $this;
    }

    /**
     * @return Collection<int, Employee>
     */
    public function getEmployees(): Collection
    {
        return $this->employees;
    }

    /**
     * @param Collection<int, Employee> $employees
     * @return Role
     */
    public function setEmployees(Collection $employees): Role
    {
        $this->employees = $employees;
        return $this;
    }

    /**
     * @param Employee $employee
     * @return Role
     */
    public function addEmployee(Employee $employee): Role
    {
        if (!$this->employees->contains($employee)) {
            $this->employees->add($employee);
            $employee->addRole($this);
        }
        return $this;
    }

    /**
     * @param Employee $employee
     * @return Role
     */
    public function removeEmployee(Employee $employee): Role
    {
        if ($this->employees->removeElement($employee)) {
            $employee->removeRole($this);
        }
        return $this;
    }

    public function __toString(): string
    {
        return $this->name ?? '';
    }
}

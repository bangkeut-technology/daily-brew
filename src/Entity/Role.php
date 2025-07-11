<?php
declare(strict_types=1);

namespace App\Entity;

use App\Repository\RoleRepository;
use Doctrine\ORM\Mapping as ORM;

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
    private ?string $name = null;

    /**
     * @var string|null
     */
    #[ORM\Column(length: 100)]
    private ?string $canonicalName = null;

    /**
     * @var string|null
     */
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

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
}

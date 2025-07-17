<?php
declare(strict_types=1);


namespace App\Entity;


use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class AbstractEntity
 *
 * @package App\Entity
 * @author  Vandeth Tho <thovandeth@gmail.com>
 */
#[ORM\MappedSuperclass]
#[ORM\HasLifecycleCallbacks]
abstract class AbstractEntity
{
    /**
     * @var integer|null
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id', type: Types::INTEGER, nullable: false, options: ["unsigned" => true])]
    #[Groups([
        'user:read',
        'evaluation_criteria:read',
        'evaluation_template:read',
        'role:read',
    ])]
    protected ?int $id = null;

    /**
     * @var DateTimeImmutable|null
     */
    #[ORM\Column(name: 'created_at', type: Types::DATETIME_IMMUTABLE, nullable: false)]
    #[Groups(['user:read'])]
    protected ?DateTimeImmutable $createdAt = null;

    /**
     * @var DateTimeImmutable|null
     */
    #[ORM\Column(name: 'updated_at', type: Types::DATETIME_IMMUTABLE, nullable: false)]
    #[Groups(['user:read'])]
    protected ?DateTimeImmutable $updatedAt = null;

    /**
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    /**
     * @param DateTimeImmutable|null $createdAt
     * @return AbstractEntity
     */
    public function setCreatedAt(?DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getUpdatedAt(): ?DateTimeImmutable
    {
        return $this->updatedAt;
    }

    /**
     * @param DateTimeImmutable|null $updatedAt
     * @return AbstractEntity
     */
    public function setUpdatedAt(?DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * @return void
     */
    #[ORM\PrePersist]
    public function prePersist(): void
    {
        $this->createdAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
    }

    /**
     * @return void
     */
    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->updatedAt = new DateTimeImmutable();
    }

    /**
     * @return void
     */
    public function __clone()
    {
        $this->id = null;
    }
}

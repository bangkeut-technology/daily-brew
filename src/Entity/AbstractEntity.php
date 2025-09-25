<?php
declare(strict_types=1);

namespace App\Entity;

use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

/**
 * Class AbstractEntity
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\MappedSuperclass]
#[ORM\HasLifecycleCallbacks]
abstract class AbstractEntity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id', type: Types::INTEGER, nullable: false, options: ['unsigned' => true])]
    #[Groups([
        'attendance:read',
        'user:read',
        'criteria:read',
        'template:read',
        'role:read',
        'employee:read',
        'employee_evaluation:read',
        'employee_score:read',
    ])]
    public ?int $id = null {
        get {
            return $this->id;
        }
    }

    #[ORM\Column(type: 'string', length: 36, unique: true)]
    #[Groups([
        'attendance:read',
        'user:read',
        'criteria:read',
        'template:read',
        'role:read',
        'employee:read',
        'employee_evaluation:read',
        'employee_score:read',
    ])]
    public ?string $publicId = null {
        get {
            return $this->publicId;
        }
    }

    #[ORM\Column(name: 'created_at', type: Types::DATETIME_IMMUTABLE, nullable: false)]
    #[Groups([
        'attendance:read',
        'user:read',
        'criteria:read',
        'template:read',
        'role:read',
        'employee:read',
        'employee_evaluation:read',
        'employee_score:read',
    ])]
    protected ?DateTimeImmutable $createdAt = null;

    #[ORM\Column(name: 'updated_at', type: Types::DATETIME_IMMUTABLE, nullable: false)]
    #[Groups([
        'attendance:read',
        'user:read',
        'criteria:read',
        'template:read',
        'role:read',
        'employee:read',
        'employee_evaluation:read',
        'employee_score:read',
    ])]
    protected ?DateTimeImmutable $updatedAt = null;

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
    public function setCreatedAt(?DateTimeImmutable $createdAt): AbstractEntity
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
    public function setUpdatedAt(?DateTimeImmutable $updatedAt): AbstractEntity
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * Pre-persist lifecycle callback to set the created and updated timestamps
     * and generate a public ID for the entity.
     */
    #[ORM\PrePersist]
    public function prePersist(): void
    {
        $this->createdAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
        $this->generatePublicId();
    }

    /**
     * Generate a unique public ID for the entity if it is not already set.
     * The public ID is a base58 encoded UUID.
     */
    public function generatePublicId(): void
    {
        if (empty($this->publicId)) {
            $this->publicId = Uuid::v4()->toBase58();
        }
    }

    /**
     * Pre-update lifecycle callback to update the updated timestamp.
     */
    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->updatedAt = new DateTimeImmutable();
    }

    /**
     * Clone method to reset the ID when cloning the entity.
     * This ensures that the cloned entity is treated as a new entity.
     */
    public function __clone()
    {
        $this->id = null;
    }
}

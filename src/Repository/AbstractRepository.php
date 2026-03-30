<?php

declare(strict_types=1);

namespace App\Repository;

use App\Util\TokenGenerator;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\Exception\ORMException;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMInvalidArgumentException;
use Doctrine\ORM\TransactionRequiredException;
use Doctrine\Persistence\ManagerRegistry;
use Random\RandomException;

/**
 * Class AbstractRepository
 *
 *  Abstract repository class for managing entities.
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @template-covariant T of object
 *
 */
abstract class AbstractRepository extends ServiceEntityRepository
{
    /**
     * Constructs a new instance of the class.
     *
     * @param ManagerRegistry $registry    the manager registry object
     * @param string          $entityClass the class name of the entity
     */
    public function __construct(
        ManagerRegistry         $registry,
        private readonly string $entityClass,
        private readonly int    $publicIdLength = 8
    )
    {
        parent::__construct($registry, $entityClass);
    }

    /**
     * @return T
     */
    public function create(): object
    {
        return new $this->entityClass();
    }

    /**
     * Delete an object from the database.
     *
     * @param T    $entity
     * @param bool $andFlush tell the manager whether the object needs to be flush or not
     */
    public function delete(mixed $entity, bool $andFlush = true): void
    {
        $this->remove($entity);
        if ($andFlush) {
            $this->flush();
        }
    }

    /**
     * Update an object in the database.
     *
     * @param T    $entity  The entity to update.
     * @param bool $andFlush Tell the manager whether the object needs to be flush or not.
     *
     * @throws RandomException
     */
    public function update(mixed $entity, bool $andFlush = true): void
    {
        if ($entity->getPublicId() === null) {
            $entity->setPublicId(TokenGenerator::generatePublicId(length: $this->publicIdLength));
        }

        $this->persist($entity);
        if ($andFlush) {
            $this->flush();
        }
    }

    /**
     * @param T $entity
     */
    public function persist(mixed $entity): void
    {
        $this->getEntityManager()->persist($entity);
    }

    /**
     * Removes an entity instance.
     *
     * A removed entity will be removed from the database as a result of the flush operation.
     *
     * @param T $entity The entity instance to remove.
     */
    public function remove(mixed $entity): void
    {
        $this->getEntityManager()->remove($entity);
    }

    /**
     * Refreshes the persistent state of an entity from the database,
     * overriding any local changes that have not yet been persisted.
     *
     * @param T                        $entity   The entity object to refresh.
     * @param LockMode|int|null        $lockMode One of the \Doctrine\DBAL\LockMode::* constants
     *                                           or NULL if no specific lock mode should be used
     *                                           during the search.
     *
     * @phpstan-param LockMode::*|null $lockMode
     *
     * @throws ORMInvalidArgumentException
     * @throws ORMException
     * @throws TransactionRequiredException
     */
    public function refresh(object $entity, LockMode|int|null $lockMode = null): void
    {
        $this->getEntityManager()->refresh($entity, $lockMode);
    }

    /**
     * Flushes all changes to the object that have been queued up now to the database.
     * This effectively synchronizes the in-memory state of managed objects with the
     * database.
     */
    public function flush(): void
    {
        $this->getEntityManager()->flush();
    }

    /**
     * Locks an entity with the specified lock mode.
     *
     * @param object   $entity   The entity to lock.
     * @param LockMode $lockMode The lock mode to use (e.g., LockMode::PESSIMISTIC_WRITE).
     *
     * @throws OptimisticLockException
     */
    public function lock(object $entity, LockMode $lockMode = LockMode::PESSIMISTIC_WRITE): void
    {
        $this->getEntityManager()->lock($entity, $lockMode);
    }

    /**
     * Clears the ObjectManager. All objects that are currently managed
     * by this ObjectManager become detached.
     */
    public function clear(): void
    {
        $this->getEntityManager()->clear();
    }

    /**
     * Finds an entity by its public ID.
     *
     * Searches for a record in the database matching the given public ID.
     *
     * @param string $publicId The public ID of the entity to search for.
     *
     * @return object|null The entity object if found, or null otherwise.
     */
    public function findByPublicId(string $publicId): ?object
    {
        return $this->findOneBy(['publicId' => $publicId]);
    }

    /**
     * Checks if an entity with the given public ID exists.
     *
     * @param string $publicId The public ID to check for.
     *
     * @return bool True if an entity with the given public ID exists, false otherwise.
     */
    public function existsByPublicId(string $publicId): bool
    {
        return $this->findByPublicId($publicId) !== null;
    }

    /**
     * Generates a public ID for the entity.
     *
     * @return string The generated public ID.
     * @throws RandomException
     */
    public function generatePublicId(): string
    {
        return TokenGenerator::generatePublicId(length: $this->publicIdLength);
    }
}

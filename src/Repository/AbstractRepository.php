<?php

declare(strict_types=1);

namespace App\Repository;

use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\Exception\ORMException;
use Doctrine\ORM\ORMInvalidArgumentException;
use Doctrine\ORM\TransactionRequiredException;
use Doctrine\Persistence\ManagerRegistry;

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
    )
    {
        parent::__construct($registry, $entityClass);
    }

    /**
     * @return T
     */
    public function create()
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
     * Updates an entity instance.
     *
     * @param T    $entity   the entity to update
     * @param bool $andFlush tell the manager whether the object needs to be flush or not
     */
    public function update(mixed $entity, bool $andFlush = true): void
    {
        $this->persist($entity);
        if ($andFlush) {
            $this->flush();
        }
    }

    /**
     * Persists an entity instance.
     *
     * @param T $entity
     */
    public function persist(mixed $entity): void
    {
        $this->getEntityManager()->persist($entity);
    }

    /**
     * Removes an entity instance.
     *
     * @param T $entity
     */
    public function remove(mixed $entity): void
    {
        $this->getEntityManager()->remove($entity);
    }

    /**
     * Reloads the state of the given entity from the database.
     * This effectively refreshes the state of the entity in the current session.
     *
     * @param T $entity
     *
     * @throws ORMException
     */
    public function reload(mixed $entity): void
    {
        $this->getEntityManager()->refresh($entity);
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
     * Clears the persistence context, causing all managed entities to become detached.
     * It is useful to explicitly free memory from managed entities that do not need
     * to stay in memory.
     */
    public function clear(): void
    {
        $this->getEntityManager()->clear();
    }

    /**
     * Detaches an entity from the persistence context, causing a managed entity to
     * become detached. Unflushed changes made to the entity if any
     * (including removal of the entity), will not be synchronized to the database.
     * Entities which previously referenced the detached entity will continue to
     * reference it.
     *
     * @param T $entity
     */
    public function detach(mixed $entity): void
    {
        $this->getEntityManager()->detach($entity);
    }

    /**
     * Refreshes the persistent state of an object from the database,
     * overriding any local changes that have not yet been persisted.
     *
     * @param LockMode|int|null $lockMode One of the \Doctrine\DBAL\LockMode::* constants
     *                                    or NULL if no specific lock mode should be used
     *                                    during the search.
     * @phpstan-param LockMode::*|null $lockMode
     *
     * @throws ORMInvalidArgumentException
     * @throws ORMException
     * @throws TransactionRequiredException
     */
    public function refresh(mixed $entity, LockMode|int|null $lockMode): void
    {
        $this->getEntityManager()->refresh($entity, $lockMode);
    }

    /**
     * Counts all entities of the repository.
     *
     * @return int The total number of entities in the repository.
     */
    public function countAll(): int
    {
        return $this->count();
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
}

<?php

declare(strict_types=1);

namespace App\Repository;

use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Exception\ORMException;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class AbstractRepository.
 *
 * @author Vandeth THO <thovandeth@gmail.com>
 *
 * @template T
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
        ManagerRegistry $registry,
        private readonly string $entityClass,
    ) {
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
     * @param T $entity
     */
    public function update(mixed $entity, bool $andFlush = true): void
    {
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
     * @param T $entity
     */
    public function remove(mixed $entity): void
    {
        $this->getEntityManager()->remove($entity);
    }

    /**
     * @param T $entity
     *
     * @throws ORMException
     */
    public function reload(mixed $entity): void
    {
        $this->getEntityManager()->refresh($entity);
    }

    /**
     * Flushes all changes to the object that have been queued up to now to the database.
     * This effectively synchronizes the in-memory state of managed objects with the
     * database.
     */
    public function flush(): void
    {
        $this->getEntityManager()->flush();
    }
}

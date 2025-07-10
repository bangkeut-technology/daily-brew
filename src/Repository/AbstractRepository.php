<?php
declare(strict_types=1);


namespace App\Repository;


use App\Util\TokenGenerator;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Exception\ORMException;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Random\RandomException;

/**
 * Class AbstractRepository
 *
 * @package App\Repository
 * @author Vandeth THO <thovandeth@gmail.com>
 * @template T
 */
abstract class AbstractRepository extends ServiceEntityRepository
{

    /**
     * Constructs a new instance of the class.
     *
     * @param ManagerRegistry $registry The manager registry object.
     * @param string $entityClass The class name of the entity.
     */
    public function __construct(
        ManagerRegistry $registry,
        private readonly string $entityClass
    ){
        parent::__construct($registry, $entityClass);
    }

    /**
     * @return T
     */
    public function create()
    {
        return new $this->entityClass;
    }

    /**
     * Delete an object from the database
     *
     * @param T    $entity
     * @param bool $andFlush tell the manager whether the object need to be flush or not
     */
    public function delete(mixed $entity, bool $andFlush = true): void
    {
        $this->remove($entity);
        if ($andFlush) {
            $this->flush();
        }
    }

    /**
     * @param T    $entity
     * @param bool $andFlush
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
     *
     * @return void
     */
    public function persist(mixed $entity): void
    {
        $this->getEntityManager()->persist($entity);
    }

    /**
     * @param T $entity
     *
     * @return void
     */
    public function remove(mixed $entity): void
    {
        $this->getEntityManager()->remove($entity);
    }

    /**
     * @param T $entity
     * @throws ORMException
     */
    public function reload(mixed $entity): void
    {
        $this->getEntityManager()->refresh($entity);
    }

    /**
     * Flushes all changes to object that have been queued up too now to the database.
     * This effectively synchronizes the in-memory state of managed objects with the
     * database.
     *
     * @return void
     */
    public function flush(): void
    {
        $this->getEntityManager()->flush();
    }

    /**
     * Creates a new QueryBuilder instance without an alias.
     * The QueryBuilder provides an API for constructing and executing database queries.
     *
     * @return QueryBuilder
     */
    public function createQueryBuilderWithoutAlias(): QueryBuilder
    {
        return $this->getEntityManager()->createQueryBuilder();
    }

    /**
     * Generates a token string of specified length.
     *
     * @param int  $length  The length of the token string. Default is 128.
     * @param bool $symbols Whether to include symbols in the token string. Default is false.
     * @return string The generated token string.
     * @throws RandomException If an error occurs while generating the token.
     */
    protected static function generateToken(int $length = 128, bool $symbols = false): string
    {
        return TokenGenerator::generate(symbols: $symbols, length:  $length);
    }
}

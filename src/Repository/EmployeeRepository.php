<?php
declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\Store;
use App\Entity\User;
use App\Util\TokenGenerator;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Random\RandomException;

/**
 * Class EmployeeRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<Employee>
 *
 * @method Employee      create()
 * @method Employee|null find($id, $lockMode = null, $lockVersion = null)
 * @method Employee|null findOneBy(array $criteria, array $orderBy = null)
 * @method Employee[]    findAll()
 * @method Employee[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EmployeeRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Employee::class);
    }

    /**
     * Finds an Employee entity based on the provided store and user identifiers.
     *
     * @param Store|int    $store The store entity or its identifier.
     * @param User|int $user The user entity or its identifier.
     *
     * @return Employee|null Returns the Employee entity if found, otherwise null.
     */
    public function findByStoreAndUser(Store|int $store, User|int $user): ?Employee
    {
        return $this->findOneBy([
            'store'    => $store,
            'user' => $user,
        ]);
    }

    /**
     * Update the employee entity with an auto-generated identifier.
     * If the identifier is not set, it will generate a new one.
     *
     * @param Employee $employee The employee entity to update.
     * @param bool     $andFlush Tell the manager whether the object needs to be flush or not.
     *                           Default is true.
     * @return void
     *
     * @throws RandomException
     */
    public function updateEmployee(Employee $employee, bool $andFlush = true): void
    {
        if (null === $employee->getIdentifier()) {
            $string = TokenGenerator::getString(symbols: false);
            do {
                $identifier = TokenGenerator::generateFromString($string);
            } while ($this->isIdentifierExist($identifier));
            $employee->setIdentifier($identifier);
        }

        $this->update($employee, $andFlush);
    }

    /**
     * Check if the identifier already exists in the database.
     *
     * @param string $identifier The identifier to check.
     *
     * @return bool Returns true if the identifier is already existed, otherwise false.
     */
    private function isIdentifierExist(string $identifier): bool
    {
        return $this->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->where('e.identifier = :identifier')
            ->setParameter('identifier', $identifier)
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }

    /**
     * Find employee by identifiers and store.
     *
     * @param array $identifiers The list of employee identifiers.
     * @param Store $store       The store entity.
     *
     * @return Employee[] Returns the list of employee entities.
     */
    public function findByIdentifiersAndStore(array $identifiers, Store $store): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.identifier IN (:identifiers)')
            ->andWhere('e.store = :store')
            ->setParameter('identifiers', $identifiers)
            ->setParameter('store', $store)
            ->getQuery()
            ->getResult();
    }

    /**
     * Create a new employee entity.
     *
     * @param User  $user  The user entity.
     * @param Store $store The store entity.
     *
     * @return Employee Returns the created employee entity.
     * @throws RandomException
     */
    public function createEmployee(User $user, Store $store): Employee
    {
        $employee = new Employee();
        $employee->setUser($user);
        $employee->setStore($store);

        $this->updateEmployee($employee);

        return $employee;

    }

    /**
     * Find an employee by identifier and store.
     *
     * @param string $identifier The employee identifier.
     * @param Store  $store      The store entity.
     *
     * @return Employee|null Returns the employee entity if found, otherwise null.
     */
    public function findByIdentifierAndStore(string $identifier, Store $store): ?Employee
    {
        return $this->findOneBy([
            'identifier' => $identifier,
            'store'      => $store,
        ]);
    }

    /**
     * Find employees by user.
     *
     * @param User $user The user entity.
     *
     * @return Employee[] Returns the list of employee entities associated with the user.
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('e')
            ->select('e, s')
            ->innerJoin('e.store', 's')
            ->where('e.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

}

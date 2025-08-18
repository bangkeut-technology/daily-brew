<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\Store;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class EmployeeRepository.
 *
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
     * Finds an Employee entity based on the provided store and user publicIds.
     *
     * @param Store|int $store the store entity or its publicId
     * @param User|int  $user  the user entity or its publicId
     *
     * @return Employee|null returns the Employee entity if found, otherwise null
     */
    public function findByStoreAndUser(Store|int $store, User|int $user): ?Employee
    {
        return $this->findOneBy([
            'store' => $store,
            'user' => $user,
        ]);
    }

    /**
     * Find employee by publicIds and store.
     *
     * @param array $publicIds the list of employee publicIds
     * @param Store $store     the store entity
     *
     * @return Employee[] returns the list of employee entities
     */
    public function findByPublicIdsAndStore(array $publicIds, Store $store): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.publicId IN (:publicIds)')
            ->andWhere('e.store = :store')
            ->setParameter('publicIds', $publicIds)
            ->setParameter('store', $store)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find employee by publicIds and user.
     *
     * @param array $publicIds the list of employee publicIds
     * @param User  $user      the user entity
     * @return Employee[] returns the list of employee entities
     */
    public function findByPublicIdsAndUser(array $publicIds, User $user): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.publicId IN (:publicIds)')
            ->andWhere('e.user = :user')
            ->setParameter('publicIds', $publicIds)
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

    /**
     * Create a new employee entity.
     *
     * @param User  $user  the user entity
     * @param Store $store the store entity
     *
     * @return Employee returns the created employee entity
     */
    public function createEmployee(User $user, Store $store): Employee
    {
        $employee = new Employee();
        $employee->setUser($user);
        $employee->setStore($store);

        $this->update($employee);

        return $employee;
    }

    /**
     * Find an employee by publicId and store.
     *
     * @param string $publicId the employee publicId
     * @param Store  $store    the store entity
     *
     * @return Employee|null returns the employee entity if found, otherwise null
     */
    public function findByPublicIdAndStore(string $publicId, Store $store): ?Employee
    {
        return $this->findOneBy([
            'publicId' => $publicId,
            'store' => $store,
        ]);
    }

    /**
     * Find employees by user.
     *
     * @param User $user the user entity
     *
     * @return Employee[] returns the list of employee entities associated with the user
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('e')
            ->select('e, s')
            ->leftJoin('e.store', 's')
            ->where('e.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

    /**
     * Count the number of employees associated with a specific user.
     *
     * @param User|UserInterface $user the user entity or interface
     *
     * @return int returns the count of employees for the specified user
     */
    public function countByUser(User|UserInterface $user): int
    {
        return $this->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->where('e.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Find an employee by publicId and user.
     *
     * @param string $publicId the employee publicId
     * @param User   $user     the user entity
     *
     * @return Employee|null returns the employee entity if found, otherwise null
     */
    public function findByPublicIdAndUser(string $publicId, User $user): ?Employee
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.publicId = :publicId')
            ->andWhere('e.user = :user')
            ->setParameter('publicId', $publicId)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Finds entities by their IDs and a specific user.
     *
     * @param int[]     $ids  Array of IDs to filter by.
     * @param User|null $user The user to filter entities by, or null.
     *
     * @return Employee[]           Returns an array of Employee objects matching the criteria.
     */
    public function findByIdsAndUser(array $ids, ?User $user): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.id IN (:ids)')
            ->andWhere('e.user = :user')
            ->setParameter('ids', $ids)
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }
}

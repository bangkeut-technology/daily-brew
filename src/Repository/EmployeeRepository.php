<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\EmployeeStatusEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Query\Parameter;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class EmployeeRepository.
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<Employee>
 *
 * @method Employee      create()
 * @method Employee|null find($id, $lockMode = null, $lockVersion = null)
 * @method Employee|null findOneBy(array $criteria, array $orderBy = null)
 * @method Employee|null findByPublicId(string $publicId)
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
     * Finds an Employee entity based on the provided workspace and user.
     *
     * @param Workspace|int $workspace the workspace entity or its id
     * @param User|int      $user      the user entity or its id
     *
     * @return Employee|null returns the Employee entity if found, otherwise null
     */
    public function findByWorkspaceAndUser(Workspace|int $workspace, User|int $user): ?Employee
    {
        return $this->findOneBy([
            'workspace' => $workspace,
            'user' => $user,
        ]);
    }

    /**
     * Find employee by publicIds and workspace.
     *
     * @param array     $publicIds the list of employee publicIds
     * @param Workspace $workspace the workspace entity
     *
     * @return Employee[] returns the list of employee entities
     */
    public function findByPublicIdsAndWorkspace(array $publicIds, Workspace $workspace): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.publicId IN (:publicIds)')
            ->andWhere('e.workspace = :workspace')
            ->setParameter('publicIds', $publicIds)
            ->setParameter('workspace', $workspace)
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
     * @param User      $user      the user entity
     * @param Workspace $workspace the workspace entity
     *
     * @return Employee returns the created employee entity
     */
    public function createEmployee(User $user, Workspace $workspace): Employee
    {
        $employee = new Employee();
        $employee->setUser($user);
        $employee->setWorkspace($workspace);

        $this->update($employee);

        return $employee;
    }

    /**
     * Find an employee by publicId and workspace.
     *
     * @param string    $publicId  the employee publicId
     * @param Workspace $workspace the workspace entity
     *
     * @return Employee|null returns the employee entity if found, otherwise null
     */
    public function findByPublicIdAndWorkspace(string $publicId, Workspace $workspace): ?Employee
    {
        return $this->findOneBy([
            'publicId' => $publicId,
            'workspace' => $workspace,
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

    /**
     * Searches for active employees associated with a given owner.
     *
     * @param User $user The owner to filter employees by.
     *
     * @return array An array of active employees associated with the given owner.
     */
    public function findActiveByOwner(User $user): array
    {
        return $this->findStatus($user, EmployeeStatusEnum::ACTIVE);
    }

    /**
     * Method to find employees based on user and status.
     *
     * @param User               $user   The user entity to filter results by.
     * @param EmployeeStatusEnum $status The status enumeration to filter results by.
     *
     * @return Employee[] Returns an array of Employee entities that match the criteria.
     */
    public function findStatus(User $user, EmployeeStatusEnum $status): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.user = :user')
            ->andWhere('e.status = :status')
            ->setParameters(new ArrayCollection([
                new Parameter('status', $status),
                new Parameter('user', $user),
            ]))
            ->getQuery()
            ->getResult();
    }

    /**
     * Deletes entities associated with a specific user.
     *
     * @param User $user The user whose associated entities should be deleted.
     *
     * @return int The number of entities deleted.
     */
    public function deleteByUser(User $user): int
    {
        return $this->createQueryBuilder('e')
            ->delete()
            ->where('e.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }

    /**
     * Finds employees associated with a specific user that do not have a workspace assigned.
     *
     * @param User $user The user whose associated employees without workspace should be found.
     *
     * @return Employee[] Returns an array of Employee entities that match the criteria.
     */
    public function findByUserWithoutWorkspace(User $user)
    {
        return $this->createQueryBuilder('e')
            ->where('e.user = :user')
            ->andWhere('e.workspace IS NULL')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }
}

<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\EmployeeStatusEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Employee>
 */
class EmployeeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Employee::class);
    }

    public function findByPublicId(string $publicId): ?Employee
    {
        return $this->findOneBy(['publicId' => $publicId]);
    }

    /** @return Employee[] */
    public function findByLinkedUser(User $user): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.linkedUser = :user')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('user', $user)
            ->orderBy('e.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findOneByLinkedUserAndWorkspace(User $user, Workspace $workspace): ?Employee
    {
        return $this->createQueryBuilder('e')
            ->where('e.linkedUser = :user')
            ->andWhere('e.workspace = :ws')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('user', $user)
            ->setParameter('ws', $workspace)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** @return Employee[] */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.workspace = :ws')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('ws', $workspace)
            ->orderBy('e.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /** @return Employee[] */
    public function findActiveByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.workspace = :ws')
            ->andWhere('e.status = :status')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('ws', $workspace)
            ->setParameter('status', EmployeeStatusEnum::ACTIVE)
            ->orderBy('e.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function countActiveByWorkspace(Workspace $workspace): int
    {
        return (int) $this->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->where('e.workspace = :ws')
            ->andWhere('e.status = :status')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('ws', $workspace)
            ->setParameter('status', EmployeeStatusEnum::ACTIVE)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findDuplicate(Workspace $workspace, string $firstName, string $lastName): ?Employee
    {
        return $this->createQueryBuilder('e')
            ->where('e.workspace = :ws')
            ->andWhere('e.firstName = :fn')
            ->andWhere('e.lastName = :ln')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('ws', $workspace)
            ->setParameter('fn', $firstName)
            ->setParameter('ln', $lastName)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** Soft-delete all employees created by the given user. */
    public function softDeleteByCreator(User $user, \DateTimeImmutable $deletedAt): void
    {
        $this->createQueryBuilder('e')
            ->update()
            ->set('e.deletedAt', ':now')
            ->where('e.user = :user')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('now', $deletedAt)
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }
}

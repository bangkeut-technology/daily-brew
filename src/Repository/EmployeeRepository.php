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

    public function findByQrToken(string $qrToken): ?Employee
    {
        return $this->findOneBy(['qrToken' => $qrToken]);
    }

    public function findByLinkedUser(User $user): ?Employee
    {
        return $this->findOneBy(['linkedUser' => $user]);
    }

    /** @return Employee[] */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->findBy(['workspace' => $workspace], ['firstName' => 'ASC']);
    }

    /** @return Employee[] */
    public function findActiveByWorkspace(Workspace $workspace): array
    {
        return $this->findBy(
            ['workspace' => $workspace, 'status' => EmployeeStatusEnum::ACTIVE],
            ['firstName' => 'ASC']
        );
    }

    public function countActiveByWorkspace(Workspace $workspace): int
    {
        return $this->count(['workspace' => $workspace, 'status' => EmployeeStatusEnum::ACTIVE]);
    }
}

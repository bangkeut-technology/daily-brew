<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\EmployeeSalary;
use App\Entity\Workspace;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class EmployeeSalaryRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends AbstractRepository<EmployeeSalary>
 *
 * @method EmployeeSalary      create()
 * @method EmployeeSalary|null find($id, $lockMode = null, $lockVersion = null)
 * @method EmployeeSalary|null findOneBy(array $criteria, array $orderBy = null)
 * @method EmployeeSalary|null findByPublicId(string $publicId)
 * @method EmployeeSalary[]    findAll()
 * @method EmployeeSalary[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EmployeeSalaryRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EmployeeSalary::class);
    }

    /**
     * Find salary by employee.
     *
     * @param Employee $employee
     * @return EmployeeSalary|null
     */
    public function findByEmployee(Employee $employee): ?EmployeeSalary
    {
        return $this->findOneBy(['employee' => $employee]);
    }

    /**
     * Find all salaries for a workspace.
     *
     * @param Workspace $workspace
     * @return EmployeeSalary[]
     */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->findBy(['workspace' => $workspace]);
    }
}

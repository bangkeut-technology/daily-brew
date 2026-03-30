<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\EmployeeStatusEnum;
use Doctrine\ORM\EntityManagerInterface;

class EmployeeService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function create(
        Workspace $workspace,
        string $firstName,
        string $lastName,
        ?string $phoneNumber = null,
        ?Shift $shift = null,
    ): Employee {
        $employee = new Employee();
        $employee->setWorkspace($workspace);
        $employee->setFirstName($firstName);
        $employee->setLastName($lastName);
        $employee->setPhoneNumber($phoneNumber);
        $employee->setShift($shift);
        // Set the workspace owner as the creator
        $employee->setUser($workspace->getOwner());

        $this->em->persist($employee);
        $this->em->flush();

        return $employee;
    }

    public function update(
        Employee $employee,
        string $firstName,
        string $lastName,
        ?string $phoneNumber,
        ?Shift $shift,
        ?bool $active = null,
    ): Employee {
        $employee->setFirstName($firstName);
        $employee->setLastName($lastName);
        $employee->setPhoneNumber($phoneNumber);
        $employee->setShift($shift);
        if ($active !== null) {
            $employee->setStatus($active ? EmployeeStatusEnum::ACTIVE : EmployeeStatusEnum::INACTIVE);
        }
        $this->em->flush();

        return $employee;
    }

    public function linkUser(Employee $employee, ?User $user): Employee
    {
        $employee->setLinkedUser($user);
        $this->em->flush();

        return $employee;
    }

    public function delete(Employee $employee): void
    {
        $employee->setDeletedAt(new \DateTimeImmutable());
        $employee->setLinkedUser(null);
        $this->em->flush();
    }
}

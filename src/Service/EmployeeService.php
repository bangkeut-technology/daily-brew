<?php

namespace App\Service;

use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use Doctrine\ORM\EntityManagerInterface;

class EmployeeService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function create(Workspace $workspace, string $name, ?string $phone = null, ?Shift $shift = null): Employee
    {
        $employee = new Employee();
        $employee->setWorkspace($workspace);
        $employee->setName($name);
        $employee->setPhone($phone);
        $employee->setShift($shift);

        $this->em->persist($employee);
        $this->em->flush();

        return $employee;
    }

    public function update(Employee $employee, string $name, ?string $phone, ?Shift $shift, ?bool $active = null): Employee
    {
        $employee->setName($name);
        $employee->setPhone($phone);
        $employee->setShift($shift);
        if ($active !== null) {
            $employee->setActive($active);
        }
        $this->em->flush();

        return $employee;
    }

    public function linkUser(Employee $employee, User $user): Employee
    {
        $employee->setUser($user);
        $this->em->flush();

        return $employee;
    }

    public function delete(Employee $employee): void
    {
        $this->em->remove($employee);
        $this->em->flush();
    }
}

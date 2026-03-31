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
        private NotificationService $notificationService,
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
        $previousShift = $employee->getShift();
        $employee->setFirstName($firstName);
        $employee->setLastName($lastName);
        $employee->setPhoneNumber($phoneNumber);
        $employee->setShift($shift);
        if ($active !== null) {
            $employee->setStatus($active ? EmployeeStatusEnum::ACTIVE : EmployeeStatusEnum::INACTIVE);
        }
        $this->em->flush();

        if ($shift !== null && $shift !== $previousShift) {
            $this->notificationService->notifyShiftAssigned($employee);
        }

        return $employee;
    }

    public function linkUser(Employee $employee, ?User $user): Employee
    {
        $previousUser = $employee->getLinkedUser();
        $employee->setLinkedUser($user);

        // If unlinking, clear currentWorkspace if it pointed to this workspace
        if ($user === null && $previousUser !== null) {
            $this->clearCurrentWorkspaceIfMatches($previousUser, $employee->getWorkspace());
        }

        $this->em->flush();

        return $employee;
    }

    public function delete(Employee $employee): void
    {
        $linkedUser = $employee->getLinkedUser();
        $employee->setDeletedAt(new \DateTimeImmutable());
        $employee->setLinkedUser(null);

        // Clear currentWorkspace if the deleted employee's user was viewing this workspace
        if ($linkedUser !== null) {
            $this->clearCurrentWorkspaceIfMatches($linkedUser, $employee->getWorkspace());
        }

        $this->em->flush();
    }

    private function clearCurrentWorkspaceIfMatches(User $user, ?Workspace $workspace): void
    {
        if ($workspace === null) {
            return;
        }

        $current = $user->getCurrentWorkspace();
        if ($current !== null && $current->getId() === $workspace->getId()) {
            // Only clear if user is not also the owner of this workspace
            if ($workspace->getOwner()?->getId() !== $user->getId()) {
                $user->setCurrentWorkspace(null);
            }
        }
    }
}

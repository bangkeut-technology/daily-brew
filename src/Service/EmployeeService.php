<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\EmployeeStatusEnum;
use App\Repository\EmployeeRepository;
use App\Service\Image\AvatarImageProcessor;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class EmployeeService
{
    public function __construct(
        private EmployeeRepository $employeeRepository,
        private NotificationService $notificationService,
        private AvatarImageProcessor $imageProcessor,
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

        $this->employeeRepository->persist($employee);
        $this->employeeRepository->flush();

        return $employee;
    }

    public function update(
        Employee $employee,
        string $firstName,
        string $lastName,
        ?string $phoneNumber,
        ?Shift $shift,
        ?bool $active = null,
        ?\DateTimeImmutable $leftAt = null,
    ): Employee {
        $previousShift = $employee->getShift();
        $employee->setFirstName($firstName);
        $employee->setLastName($lastName);
        $employee->setPhoneNumber($phoneNumber);
        $employee->setShift($shift);
        if ($active !== null) {
            $newStatus = $active ? EmployeeStatusEnum::ACTIVE : EmployeeStatusEnum::INACTIVE;
            $statusChanged = $newStatus !== $employee->getStatus();
            if ($statusChanged) {
                $employee->setStatus($newStatus);
            }
            // leftAt is the "last day worked" — captured from the deactivation
            // modal so historical attendance still surfaces for prior days, and
            // delayed deactivations don't fabricate absent rows. Cleared on
            // re-activation regardless of what the caller passes.
            if ($newStatus === EmployeeStatusEnum::INACTIVE) {
                if ($statusChanged || $leftAt !== null) {
                    $employee->setLeftAt($leftAt ?? DateService::now());
                }
            } else {
                $employee->setLeftAt(null);
            }
        }
        $this->employeeRepository->flush();

        if ($shift !== null && $shift !== $previousShift) {
            $this->notificationService->notifyShiftAssigned($employee);
        }

        return $employee;
    }

    public function linkUser(Employee $employee, ?User $user): Employee
    {
        $previousUser = $employee->getLinkedUser();
        $employee->setLinkedUser($user);

        // linkedAt anchors the absent baseline. Stamp on link transitions only:
        // - null → user: first link, stamp now
        // - user → null: unlink, clear so a future re-link sets a fresh anchor
        // - user → different user: re-link, stamp now (new relationship)
        // - user → same user: no transition, leave anchor untouched
        if ($user === null) {
            $employee->setLinkedAt(null);
        } elseif ($previousUser === null || $previousUser->getId() !== $user->getId()) {
            $employee->setLinkedAt(DateService::now());
        }

        // If unlinking, clear currentWorkspace if it pointed to this workspace
        if ($user === null && $previousUser !== null) {
            $this->clearCurrentWorkspaceIfMatches($previousUser, $employee->getWorkspace());
        }

        $this->employeeRepository->flush();

        return $employee;
    }

    /**
     * Stores a square 512×512 JPEG headshot via Vich's "employees" mapping.
     *
     * @throws \InvalidArgumentException when the upload fails validation
     *         (see {@see \App\Service\Image\AvatarImageProcessor}).
     */
    public function uploadPhoto(Employee $employee, UploadedFile $file): Employee
    {
        $processed = $this->imageProcessor->process($file);
        $employee->setImageFile($processed);
        $this->employeeRepository->flush();

        return $employee;
    }

    public function removePhoto(Employee $employee): void
    {
        if ($employee->getImageName() === null) {
            return;
        }

        $employee->setImageFile(null);
        $employee->setImageName(null);
        $employee->setFileSize(null);
        $employee->setOriginalName(null);
        $employee->setMimeType(null);
        $employee->setDimensions(null);
        $this->employeeRepository->flush();
    }

    public function delete(Employee $employee): void
    {
        $linkedUser = $employee->getLinkedUser();
        $employee->setDeletedAt(DateService::now());
        $employee->setLinkedUser(null);
        $employee->setLinkedAt(null);

        // Clear currentWorkspace if the deleted employee's user was viewing this workspace
        if ($linkedUser !== null) {
            $this->clearCurrentWorkspaceIfMatches($linkedUser, $employee->getWorkspace());
        }

        $this->employeeRepository->flush();
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

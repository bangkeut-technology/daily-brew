<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Subscription;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use Doctrine\ORM\EntityManagerInterface;

class WorkspaceService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function create(User $owner, string $name): Workspace
    {
        $workspace = new Workspace();
        $workspace->setName($name);
        $workspace->setOwner($owner);

        $setting = new WorkspaceSetting();
        $setting->setWorkspace($workspace);
        $workspace->setSetting($setting);

        $subscription = new Subscription();
        $subscription->setWorkspace($workspace);

        // Set as current workspace for the owner
        $owner->setCurrentWorkspace($workspace);

        $this->em->persist($workspace);
        $this->em->persist($setting);
        $this->em->persist($subscription);
        $this->em->flush();

        return $workspace;
    }

    public function update(Workspace $workspace, string $name): Workspace
    {
        $workspace->setName($name);
        $this->em->flush();

        return $workspace;
    }

    public function delete(Workspace $workspace): void
    {
        $now = new \DateTimeImmutable();

        // Soft-delete all employees in this workspace
        foreach ($workspace->getEmployees() as $employee) {
            $employee->setDeletedAt($now);
            $employee->setLinkedUser(null);
        }

        $workspace->setDeletedAt($now);
        $this->em->flush();
    }
}

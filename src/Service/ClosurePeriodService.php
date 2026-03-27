<?php

namespace App\Service;

use App\Entity\ClosurePeriod;
use App\Entity\Workspace;
use Doctrine\ORM\EntityManagerInterface;

class ClosurePeriodService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function create(Workspace $workspace, string $name, \DateTimeInterface $startDate, \DateTimeInterface $endDate): ClosurePeriod
    {
        $closure = new ClosurePeriod();
        $closure->setWorkspace($workspace);
        $closure->setName($name);
        $closure->setStartDate($startDate);
        $closure->setEndDate($endDate);

        $this->em->persist($closure);
        $this->em->flush();

        return $closure;
    }

    public function update(ClosurePeriod $closure, string $name, \DateTimeInterface $startDate, \DateTimeInterface $endDate): ClosurePeriod
    {
        $closure->setName($name);
        $closure->setStartDate($startDate);
        $closure->setEndDate($endDate);
        $this->em->flush();

        return $closure;
    }

    public function delete(ClosurePeriod $closure): void
    {
        $this->em->remove($closure);
        $this->em->flush();
    }
}

<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Shift;
use App\Entity\Workspace;
use Doctrine\ORM\EntityManagerInterface;

class ShiftService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function create(Workspace $workspace, string $name, \DateTimeInterface $startTime, \DateTimeInterface $endTime): Shift
    {
        $shift = new Shift();
        $shift->setWorkspace($workspace);
        $shift->setName($name);
        $shift->setStartTime($startTime);
        $shift->setEndTime($endTime);

        $this->em->persist($shift);
        $this->em->flush();

        return $shift;
    }

    public function update(Shift $shift, string $name, \DateTimeInterface $startTime, \DateTimeInterface $endTime): Shift
    {
        $shift->setName($name);
        $shift->setStartTime($startTime);
        $shift->setEndTime($endTime);
        $this->em->flush();

        return $shift;
    }

    public function delete(Shift $shift): void
    {
        $this->em->remove($shift);
        $this->em->flush();
    }
}

<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Shift;
use App\Entity\Workspace;
use App\Repository\ShiftRepository;
use DateTimeInterface;
use Random\RandomException;

readonly class ShiftService
{
    public function __construct(
        private ShiftRepository $shiftRepository,
    ) {}

    /**
     * @throws RandomException
     */
    public function create(Workspace $workspace, string $name, DateTimeInterface $startTime, DateTimeInterface $endTime): Shift
    {
        $shift = new Shift();
        $shift->setWorkspace($workspace);
        $shift->setName($name);
        $shift->setStartTime($startTime);
        $shift->setEndTime($endTime);

        $this->shiftRepository->update($shift);

        return $shift;
    }

    public function update(Shift $shift, string $name, DateTimeInterface $startTime, DateTimeInterface $endTime): Shift
    {
        $shift->setName($name);
        $shift->setStartTime($startTime);
        $shift->setEndTime($endTime);
        $this->shiftRepository->update($shift);

        return $shift;
    }

    public function delete(Shift $shift): void
    {
        $this->shiftRepository->delete($shift);
    }
}

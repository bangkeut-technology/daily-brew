<?php

namespace App\Service;

use App\Entity\ClosurePeriod;
use App\Entity\Workspace;
use App\Repository\ClosurePeriodRepository;

readonly class ClosurePeriodService
{
    public function __construct(
        private ClosurePeriodRepository $closurePeriodRepository,
        private NotificationService     $notificationService,
    )
    {
    }

    public function create(Workspace $workspace, string $name, \DateTimeInterface $startDate, \DateTimeInterface $endDate): ClosurePeriod
    {
        $closure = new ClosurePeriod();
        $closure->setWorkspace($workspace);
        $closure->setName($name);
        $closure->setStartDate($startDate);
        $closure->setEndDate($endDate);

        $this->closurePeriodRepository->persist($closure);
        $this->closurePeriodRepository->flush();

        $this->notificationService->notifyClosureCreated($closure);

        return $closure;
    }

    public function update(ClosurePeriod $closure, string $name, \DateTimeInterface $startDate, \DateTimeInterface $endDate): ClosurePeriod
    {
        $closure->setName($name);
        $closure->setStartDate($startDate);
        $closure->setEndDate($endDate);
        $this->closurePeriodRepository->flush();

        return $closure;
    }

    public function delete(ClosurePeriod $closure): void
    {
        $this->closurePeriodRepository->delete($closure);
    }
}

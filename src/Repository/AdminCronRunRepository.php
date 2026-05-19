<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\AdminCronRun;
use Doctrine\Persistence\ManagerRegistry;

class AdminCronRunRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AdminCronRun::class);
    }

    /**
     * @return AdminCronRun[]
     */
    public function findRecentByCommand(string $command, int $limit = 20): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.command = :command')
            ->setParameter('command', $command)
            ->orderBy('r.startedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * @param array<int, string> $commands
     * @return array<string, AdminCronRun> keyed by command
     */
    public function findLastRunByCommand(array $commands): array
    {
        if ($commands === []) {
            return [];
        }
        $rows = $this->createQueryBuilder('r')
            ->where('r.command IN (:commands)')
            ->andWhere('r.startedAt = (
                SELECT MAX(r2.startedAt) FROM ' . AdminCronRun::class . ' r2
                WHERE r2.command = r.command
            )')
            ->setParameter('commands', $commands)
            ->getQuery()
            ->getResult();

        $out = [];
        foreach ($rows as $row) {
            /** @var AdminCronRun $row */
            $out[$row->getCommand()] = $row;
        }
        return $out;
    }
}

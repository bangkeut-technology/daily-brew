<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\MobileAppConfig;
use Doctrine\Persistence\ManagerRegistry;

class MobileAppConfigRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MobileAppConfig::class);
    }

    /**
     * Always returns a row. If the singleton hasn't been created yet (fresh
     * install or migration hasn't seeded), creates an empty one so callers
     * can read default null values without crashing.
     */
    public function getOrCreate(): MobileAppConfig
    {
        $existing = $this->createQueryBuilder('m')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if ($existing instanceof MobileAppConfig) {
            return $existing;
        }

        $config = new MobileAppConfig();
        $this->persist($config);
        $this->flush();

        return $config;
    }
}

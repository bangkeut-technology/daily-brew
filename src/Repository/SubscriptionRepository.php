<?php

namespace App\Repository;

use App\Entity\Subscription;
use App\Entity\Workspace;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class SubscriptionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Subscription::class);
    }

    public function findByWorkspace(Workspace $workspace): ?Subscription
    {
        return $this->findOneBy(['workspace' => $workspace]);
    }

    public function findByPaddleSubscriptionId(string $paddleSubscriptionId): ?Subscription
    {
        return $this->findOneBy(['paddleSubscriptionId' => $paddleSubscriptionId]);
    }
}

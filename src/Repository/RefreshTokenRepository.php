<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\RefreshToken;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<RefreshToken>
 */
class RefreshTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RefreshToken::class);
    }

    /** Revoke all refresh tokens for the given user identifier (email). */
    public function revokeByUsername(string $username): void
    {
        $this->createQueryBuilder('rt')
            ->delete()
            ->where('rt.username = :username')
            ->setParameter('username', $username)
            ->getQuery()
            ->execute();
    }
}

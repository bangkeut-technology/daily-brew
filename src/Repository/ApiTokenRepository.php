<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\ApiToken;
use App\Entity\Workspace;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ApiTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ApiToken::class);
    }

    /** Find an active (non-revoked) token by its hash. */
    public function findActiveByHash(string $tokenHash): ?ApiToken
    {
        return $this->createQueryBuilder('t')
            ->where('t.tokenHash = :hash')
            ->andWhere('t.revokedAt IS NULL')
            ->setParameter('hash', $tokenHash)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** @return ApiToken[] All tokens for a workspace (active + revoked). */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.workspace = :ws')
            ->setParameter('ws', $workspace)
            ->orderBy('t.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** @return ApiToken[] Active tokens for a workspace. */
    public function findActiveByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.workspace = :ws')
            ->andWhere('t.revokedAt IS NULL')
            ->setParameter('ws', $workspace)
            ->orderBy('t.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function persist(ApiToken $token): void
    {
        $this->getEntityManager()->persist($token);
    }

    public function flush(): void
    {
        $this->getEntityManager()->flush();
    }
}

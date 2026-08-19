<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\EmployeeCard;
use App\Entity\Workspace;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractRepository<EmployeeCard>
 */
class EmployeeCardRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EmployeeCard::class);
    }

    /**
     * Resolve a presented pass to its card, scoped to the audience it names.
     * Revoked cards are returned deliberately — the revocation store answers
     * that question, and conflating "unknown card" with "withdrawn card" would
     * hand a forger a way to probe which pass ids exist.
     */
    public function findByPassIdAndWorkspacePublicId(string $passId, string $workspacePublicId): ?EmployeeCard
    {
        return $this->createQueryBuilder('c')
            ->join('c.workspace', 'w')
            ->where('c.publicId = :passId')
            ->andWhere('w.publicId = :ws')
            ->setParameter('passId', $passId)
            ->setParameter('ws', $workspacePublicId)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findOneByPublicIdAndWorkspace(string $publicId, Workspace $workspace): ?EmployeeCard
    {
        return $this->findOneBy(['publicId' => $publicId, 'workspace' => $workspace]);
    }

    /** @return array<int, EmployeeCard> */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.workspace = :ws')
            ->setParameter('ws', $workspace)
            ->orderBy('c.revokedAt', 'ASC')
            ->addOrderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** @return array<int, EmployeeCard> */
    public function findActiveByEmployee(Employee $employee): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.employee = :emp')
            ->andWhere('c.revokedAt IS NULL')
            ->setParameter('emp', $employee)
            ->getQuery()
            ->getResult();
    }
}

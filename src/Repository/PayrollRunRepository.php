<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\PayrollRun;
use App\Entity\Workspace;
use DateTimeImmutable;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class PayrollRunRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends AbstractRepository<PayrollRun>
 *
 * @method PayrollRun      create()
 * @method PayrollRun|null find($id, $lockMode = null, $lockVersion = null)
 * @method PayrollRun|null findOneBy(array $criteria, array $orderBy = null)
 * @method PayrollRun|null findByPublicId(string $publicId)
 * @method PayrollRun[]    findAll()
 * @method PayrollRun[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PayrollRunRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PayrollRun::class);
    }

    /**
     * Find a payroll run by workspace and period.
     *
     * @param Workspace         $workspace
     * @param DateTimeImmutable $period
     * @return PayrollRun|null
     */
    public function findByWorkspaceAndPeriod(Workspace $workspace, DateTimeImmutable $period): ?PayrollRun
    {
        return $this->findOneBy([
            'workspace' => $workspace,
            'period' => $period,
        ]);
    }

    /**
     * Find all payroll runs for a workspace.
     *
     * @param Workspace $workspace
     * @return PayrollRun[]
     */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('pr')
            ->where('pr.workspace = :workspace')
            ->setParameter('workspace', $workspace)
            ->orderBy('pr.period', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find a payroll run by public ID and workspace.
     *
     * @param string    $publicId
     * @param Workspace $workspace
     * @return PayrollRun|null
     */
    public function findByPublicIdAndWorkspace(string $publicId, Workspace $workspace): ?PayrollRun
    {
        return $this->findOneBy([
            'publicId' => $publicId,
            'workspace' => $workspace,
        ]);
    }
}

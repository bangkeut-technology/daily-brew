<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Shift;
use App\Entity\Workspace;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class ShiftRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends AbstractRepository<Shift>
 *
 * @method Shift      create()
 * @method Shift|null find($id, $lockMode = null, $lockVersion = null)
 * @method Shift|null findOneBy(array $criteria, array $orderBy = null)
 * @method Shift|null findByPublicId(string $publicId)
 * @method Shift[]    findAll()
 * @method Shift[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ShiftRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Shift::class);
    }

    /**
     * @param Workspace $workspace
     * @return Shift[]
     */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.workspace = :workspace')
            ->setParameter('workspace', $workspace)
            ->orderBy('s.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByPublicIdAndWorkspace(string $publicId, Workspace $workspace): ?Shift
    {
        return $this->findOneBy(['publicId' => $publicId, 'workspace' => $workspace]);
    }
}

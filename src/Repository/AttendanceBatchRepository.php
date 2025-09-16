<?php
declare(strict_types=1);


namespace App\Repository;

use App\Entity\AttendanceBatch;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class AttendanceBatchRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<AttendanceBatch>
 *
 * @method AttendanceBatch      create()
 * @method AttendanceBatch|null find($id, $lockMode = null, $lockVersion = null)
 * @method AttendanceBatch|null findOneBy(array $criteria, array $orderBy = null)
 * @method AttendanceBatch[]    findAll()
 * @method AttendanceBatch[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AttendanceBatchRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AttendanceBatch::class);
    }
}

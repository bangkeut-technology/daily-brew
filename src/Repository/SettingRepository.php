<?php
declare(strict_types=1);


namespace App\Repository;

use App\Constant\SettingConstant as SettingConstant;
use App\Entity\Setting;
use App\Entity\Store;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class SettingRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<Setting>
 *
 * @method Setting      create()
 * @method Setting|null find($id, $lockMode = null, $lockVersion = null)
 * @method Setting|null findOneBy(array $criteria, array $orderBy = null)
 * @method Setting[]    findAll()
 * @method Setting[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SettingRepository extends AbstractRepository
{
    /**
     * SettingRepository constructor.
     *
     * @param ManagerRegistry $registry The registry.
     */
    public function __construct(
        ManagerRegistry $registry,
    )
    {
        parent::__construct($registry, Setting::class);
    }
}

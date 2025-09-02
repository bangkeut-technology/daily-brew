<?php
declare(strict_types=1);


namespace App\Repository;

use App\Entity\Setting;
use App\Entity\User;
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

    /**
     * Finds entities by the given User.
     *
     * @param User $user The user entity to search by.
     *
     * @return Setting[] An array of entities associated with the given user.
     */
    public function findByUser(User $user): array
    {
        return $this->findBy(['owner' => $user]);

    }

    /**
     * Retrieves a setting by its names and store.
     *
     * @param string[] $names The names of the setting to retrieve.
     * @param User     $user  The user associated with the setting.
     *
     * @return Setting[] The retrieved settings.
     */
    public function findByNamesAndUser(array $names, User $user): array
    {
        return $this->findBy(['name' => $names, 'owner' => $user]);
    }

    /**
     * Finds a setting by its name and user.
     *
     * @param string $name The name of the setting to retrieve.
     * @param User   $user The user associated with the setting.
     *
     * @return Setting|null The retrieved setting, or null if not found.
     */
    public function findByNameAndUser(string $name, User $user): ?Setting
    {
        return $this->findOneBy(['name' => $name, 'owner' => $user]);
    }
}

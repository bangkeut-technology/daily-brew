<?php
declare(strict_types=1);


namespace App\Repository;

use App\Entity\UserSetting;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class UserSettingRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<UserSetting>
 *
 * @method UserSetting      create()
 * @method UserSetting|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserSetting|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserSetting|null findByPublicId(string $publicId)
 * @method UserSetting[]    findAll()
 * @method UserSetting[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserSettingRepository extends AbstractRepository
{
    /**
     * UserSettingRepository constructor.
     *
     * @param ManagerRegistry $registry The registry.
     */
    public function __construct(
        ManagerRegistry $registry,
    )
    {
        parent::__construct($registry, UserSetting::class);
    }

    /**
     * Finds entities by the given User.
     *
     * @param User $user The user entity to search by.
     *
     * @return UserSetting[] An array of entities associated with the given user.
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
     * @return UserSetting[] The retrieved settings.
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
     * @return UserSetting|null The retrieved setting, or null if not found.
     */
    public function findByNameAndUser(string $name, User $user): ?UserSetting
    {
        return $this->findOneBy(['name' => $name, 'owner' => $user]);
    }
}

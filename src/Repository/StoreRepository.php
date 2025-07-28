<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Store;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Query\Parameter;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class StoreRepository.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<Store>
 *
 * @method Store      create()
 * @method Store|null find($id, $lockMode = null, $lockVersion = null)
 * @method Store|null findOneBy(array $criteria, array $orderBy = null)
 * @method Store[]    findAll()
 * @method Store[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class StoreRepository extends AbstractRepository
{
    /**
     * StoreRepository constructor.
     *
     * @param ManagerRegistry        $registry      the registry
     */
    public function __construct(
        ManagerRegistry $registry,
    ) {
        parent::__construct($registry, Store::class);
    }

    /**
     * Retrieves a store by its canonical name and user.
     *
     * @param string $canonicalName the canonical name of the store to retrieve
     * @param User   $user          the user associated with the store
     */
    public function findByCanonicalNameAndUser(string $canonicalName, User $user): ?Store
    {
        return $this->findOneBy(['canonicalName' => $canonicalName, 'user' => $user]);
    }
    /**
     * Finds all stores by user.
     *
     * @param User|int $user the user
     *
     * @return Store[]
     */
    public function findByIdsAndUser(array $ids, User|int $user): array
    {
        return $this->findBy(['id' => $ids, 'user' => $user]);
    }

    /**
     * Finds all stores by user.
     *
     * @param User|null $user the user
     *
     * @return Store[]
     */
    public function findByUser(?User $user): array
    {
        return $this->findBy(['user' => $user]);
    }

    /**
     * Finds all user stores that are not the givens.
     *
     * @param User|null $user   the user
     * @param Store[]   $stores the stores
     *
     * @return Store[]
     */
    public function findByUserNotIn(?User $user, array $stores): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.user = :user')
            ->andWhere('s NOT IN (:stores)')
            ->setParameters(
                new ArrayCollection([
                    new Parameter('user', $user),
                    new Parameter('stores', $stores),
                ])
            )
            ->getQuery()
            ->getResult();
    }

    /**
     * Finds stores by publicIds and user.
     *
     * @param string[]  $stores  the store publicIds
     * @param User|null $getUser the user
     *
     * @return Store[]
     */
    public function findByPublicIdsAndUser(array $stores, ?User $getUser): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.publicId IN (:stores)')
            ->andWhere('s.user = :user')
            ->setParameters(
                new ArrayCollection([
                    new Parameter('stores', $stores),
                    new Parameter('user', $getUser),
                ])
            )
            ->getQuery()
            ->getResult();
    }

    /**
     * Finds a store by its publicId and user.
     *
     * @param string $publicId the publicId of the store to retrieve
     * @param User   $user       the user
     */
    public function findByPublicIdAndUser(string $publicId, User $user): ?Store
    {
        return $this->findOneBy(['publicId' => $publicId, 'user' => $user]);
    }

    public function findAsEmployee(User $user)
    {
        return $this->createQueryBuilder('s')
            ->select('s, e')
            ->innerJoin('s.user', 'u')
            ->innerJoin('c.employees', 'e')
            ->innerJoin('e.user', 'u')
            ->where('u.id = :userId')
            ->setParameter('userId', $user->getId())
            ->getQuery()
            ->getResult();
    }
}

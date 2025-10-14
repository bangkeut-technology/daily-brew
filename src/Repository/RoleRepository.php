<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Role;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class RoleRepository.
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<Role>
 *
 * @method Role      create()
 * @method Role|null find($id, $lockMode = null, $lockVersion = null)
 * @method Role|null findOneBy(array $criteria, array $orderBy = null)
 * @method Role|null findByPublicId(string $publicId)
 * @method Role[]    findAll()
 * @method Role[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class RoleRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Role::class);
    }

    /**
     * Find roles by user.
     *
     * @param User $user the user entity
     *
     * @return Role[] returns the list of role entities associated with the user
     */
    public function findByUser(User $user): array
    {
        return $this->findBy(['user' => $user]);
    }

    /**
     * Deletes roles associated with a specific user.
     *
     * This method constructs a query to delete all roles
     * where the associated user matches the given user instance.
     *
     * @param User $user The user entity whose roles should be deleted.
     *
     * @return int The number of records affected by the delete operation.
     */
    public function deleteByUser(User $user): int
    {
        return $this->createQueryBuilder('r')
            ->delete()
            ->where('r.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }

    /**
     * Retrieves a single entity by its public ID and associated user.
     *
     * @param string $publicId The public identifier of the entity.
     * @param User   $user     The user associated with the entity.
     *
     * @return Role|null The entity object if found, or null if no match is found.
     */
    public function findByPublicIdAndUser(string $publicId, User $user): ?Role
    {
        return $this->createQueryBuilder('r')
            ->where('r.publicId = :publicId')
            ->andWhere('r.user = :user')
            ->setParameter('publicId', $publicId)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }
}

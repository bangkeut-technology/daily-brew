<?php
declare(strict_types=1);


namespace App\Repository;

use App\Entity\AttendanceBatch;
use App\Entity\User;
use App\Enum\AttendanceTypeEnum;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Query\Parameter;
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
 * @method AttendanceBatch|null findByPublicId(string $publicId)
 * @method AttendanceBatch[]    findAll()
 * @method AttendanceBatch[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AttendanceBatchRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AttendanceBatch::class);
    }

    /**
     * Retrieves AttendanceBatch records based on the given criteria.
     *
     * This method constructs a query builder with specified conditions, dynamically
     * applying criteria and order parameters to retrieve matching records.
     *
     * @param array    $criteria Search criteria used to filter results.
     * @param array    $orderBy  Sorting conditions, with keys as column names and values as a sort direction (ASC/DESC).
     * @param int|null $limit    Optional maximum number of results to return.
     * @param int|null $offset   Optional starting point for the result set (useful for pagination).
     *
     * @return AttendanceBatch[] Returns an array of AttendanceBatch entities matching the specified criteria.
     */
    public function findByCriteria(array $criteria, array $orderBy = [], ?int $limit = null, ?int $offset = null): array
    {
        $qb = $this->createQueryBuilder('ab')
            ->where('ab.user = :user')
            ->andWhere('ab.label LIKE :label or :label IS NULL')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        $parameters = new ArrayCollection();
        foreach ($criteria as $key => $value) {
            $parameters->add(new Parameter($key, $value));
        }
        $qb->setParameters($parameters);

        foreach ($orderBy as $sort => $order) {
            $qb->addOrderBy($sort, $order);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Finds an entity by its public ID and associated user.
     *
     * @param string    $publicId The public ID of the entity.
     * @param User|null $user     The user associated with the entity, or null.
     *
     * @return AttendanceBatch|null The matched entity or null if not found.
     */
    public function findByPublicIdAndUser(string $publicId, ?User $user): ?AttendanceBatch
    {
        return $this->findOneBy(['publicId' => $publicId, 'user' => $user]);
    }

    /**
     * Finds an entity by its public ID and associated user.
     *
     * @param string    $publicId The public ID of the entity.
     * @param User|null $user     The user associated with the entity, or null.
     *
     * @return AttendanceBatch|null The matched entity or null if not found.
     */
    public function findByPublicIdAndUserEager(string $publicId, ?User $user): ?AttendanceBatch
    {
        return $this->createQueryBuilder('ab')
            ->addSelect('e', 'a')
            ->leftJoin('ab.employees', 'e')
            ->leftJoin('ab.attendances', 'a')
            ->where('ab.publicId = :publicId')
            ->andWhere('ab.user = :user')
            ->setParameters(new ArrayCollection([
                new Parameter('publicId', $publicId),
                new Parameter('user', $user),
            ]))
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Finds an entity by its label and associated user.
     *
     * @param string $label The label of the entity.
     * @param User   $user  The user associated with the entity.
     *
     * @return AttendanceBatch|null The matched entity or null if not found.
     */
    public function findByLabelAndUser(string $label, User $user): ?AttendanceBatch
    {
        return $this->findOneBy(['label' => $label, 'user' => $user]);
    }

    /**
     * Finds an entity by its canonical label and associated user.
     *
     * @param string $canonicalLabel The canonical label of the entity.
     * @param User   $user           The user associated with the entity.
     *
     * @return AttendanceBatch|null The matched entity or null if not found.
     */
    public function findByCanonicalLabelAndUser(string $canonicalLabel, User $user): ?AttendanceBatch
    {
        return $this->createQueryBuilder('ab')
            ->where('ab.user = :user')
            ->andWhere('ab.canonicalLabel = :canonicalLabel')
            ->setParameters(new ArrayCollection([
                new Parameter('user', $user),
                new Parameter('canonicalLabel', $canonicalLabel),
            ]))
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Finds entities by associated user.
     *
     * @param User $user The user associated with the entities.
     *
     * @return AttendanceBatch[] The matched entities.
     */
    public function findByUser(User $user): array
    {
        return $this->findBy(['user' => $user]);
    }

    /**
     * Retrieves a list of upcoming attendance batches filtered by type, user, date range, and optionally by employee public ID.
     *
     * @param User                    $user The user to which the attendances are associated.
     * @param DateTimeImmutable       $from The start date of the date range.
     * @param DateTimeImmutable       $to   The end date of the date range.
     * @param AttendanceTypeEnum|null $type The type of attendance to filter by; null includes all types.
     *
     * @return array                Returns an array of attendance batches matching the criteria.
     */
    public function findUpcomingByType(
        User                $user,
        DateTimeImmutable   $from,
        DateTimeImmutable   $to,
        ?AttendanceTypeEnum $type = null,
    ): array
    {
        $qb = $this->createQueryBuilder('ab')
            ->addSelect('e')
            ->innerJoin('ab.employees', 'e')
            ->where('ab.type = :type OR :type IS NULL')
            ->andWhere('ab.fromDate <= :to')
            ->andWhere('ab.toDate >= :from')
            ->andWhere('e.user = :user')
            ->orderBy('ab.fromDate', 'ASC')
            ->setParameters(new ArrayCollection([
                new Parameter('user', $user),
                new Parameter('type', $type),
                new Parameter('from', $from, Types::DATE_IMMUTABLE),
                new Parameter('to', $to, Types::DATE_IMMUTABLE),
            ]));

        return $qb->getQuery()->getResult();
    }

    /**
     * Deletes attendance batches associated with a specific user.
     *
     * This method constructs a query to delete all attendance batches
     * where the associated user matches the given user instance.
     *
     * @param User $user The user entity whose attendance batches should be deleted.
     *
     * @return int The number of records affected by the delete operation.
     */
    public function deleteByUser(User $user): int
    {
        return $this->createQueryBuilder('ab')
            ->delete()
            ->where('ab.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }
}

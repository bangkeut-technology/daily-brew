<?php
declare(strict_types=1);


namespace App\Repository;

use App\Entity\DemoSession;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class DemoSessionRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<DemoSession>
 *
 * @method DemoSession      create()
 * @method DemoSession|null find($id, $lockMode = null, $lockVersion = null)
 * @method DemoSession|null findOneBy(array $criteria, array $orderBy = null)
 * @method DemoSession[]    findAll()
 * @method DemoSession[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DemoSessionRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DemoSession::class);
    }

    /**
     * Finds an active demo session by its deviceId.
     *
     * @param string $deviceId the unique deviceId of the demo session
     *
     * @return DemoSession|null the found demo session or null if not found
     */
    public function findActiveDeviceId(string $deviceId): ?DemoSession
    {
        return $this->findOneBy(['deviceId' => $deviceId, 'active' => true]);
    }

    /**
     * Finds active demo sessions that have expired based on the given expiration date.
     *
     * @param DateTimeImmutable $expiredAt the current date and time
     *
     * @return DemoSession[] an array of active demo sessions that have expired
     */
    public function findActiveByExpirationDate(DateTimeImmutable $expiredAt): array
    {
        $qb = $this->createQueryBuilder('ds')
            ->where('ds.active = :active')
            ->andWhere('ds.expiresAt < :expiredAt')
            ->setParameter('active', true)
            ->setParameter('expiredAt', $expiredAt);

        return $qb->getQuery()->getResult();
    }

    /**
     * Finds a demo session by its deviceId.
     *
     * @param string $deviceId the unique deviceId of the demo session
     *
     * @return DemoSession|null the found demo session or null if not found
     */
    public function findDeviceId(string $deviceId): ?DemoSession
    {
        return $this->findOneBy(['deviceId' => $deviceId]);
    }

    /**
     * Finds active demo session for a given user.
     *
     * @param User $user the user entity to find active demo sessions for
     *
     * @return DemoSession|null the found demo session or null if not found
     */
    public function findActiveByUser(User $user): ?DemoSession
    {
        return $this->findOneBy(['user' => $user, 'active' => true]);
    }
}

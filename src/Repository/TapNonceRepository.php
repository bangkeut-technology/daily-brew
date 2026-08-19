<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\TapNonce;
use App\Service\DateService;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractRepository<TapNonce>
 */
class TapNonceRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TapNonce::class);
    }

    /**
     * Claim (scope, token) until it expires. True on first use, false if the
     * claim is already held and still live.
     *
     * Written through DBAL rather than the ORM deliberately: a unique-key
     * violation raised inside `EntityManager::flush()` **closes the manager**,
     * so an ORM insert would turn "this pass is on cooldown" — an expected,
     * routine outcome — into a request that can no longer touch the database at
     * all. The collision has to be catchable without collateral damage.
     */
    public function claim(string $scope, string $token, int $ttlSeconds): bool
    {
        $expiresAt = DateService::now()->modify(sprintf('+%d seconds', max(1, $ttlSeconds)));

        if ($this->insert($scope, $token, $expiresAt)) {
            return true;
        }

        // Collided: either the claim is genuinely live — false — or the row in
        // the way has expired, and sweeping it is what makes a cooldown expire
        // rather than becoming a permanent ban.
        $this->purgeExpired();

        return $this->insert($scope, $token, $expiresAt);
    }

    /** Drop rows whose window has passed. */
    public function purgeExpired(): int
    {
        return (int) $this->getEntityManager()->getConnection()->executeStatement(
            'DELETE FROM daily_brew_tap_nonces WHERE expires_at <= :now',
            ['now' => DateService::now()->format('Y-m-d H:i:s')],
        );
    }

    private function insert(string $scope, string $token, \DateTimeImmutable $expiresAt): bool
    {
        try {
            $this->getEntityManager()->getConnection()->executeStatement(
                'INSERT INTO daily_brew_tap_nonces (scope, token, expires_at) VALUES (:scope, :token, :expires)',
                [
                    'scope' => $scope,
                    'token' => $token,
                    'expires' => $expiresAt->format('Y-m-d H:i:s'),
                ],
            );
        } catch (UniqueConstraintViolationException) {
            return false;
        }

        return true;
    }
}

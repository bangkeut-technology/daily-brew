<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\User;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class, 12);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->findOneBy(['emailCanonical' => mb_strtolower($email)]);
    }

    public function findByGoogleId(string $googleId): ?User
    {
        return $this->findOneBy(['googleId' => $googleId]);
    }

    public function findByAppleId(string $appleId): ?User
    {
        return $this->findOneBy(['appleId' => $appleId]);
    }

    public function findByOAuth(\App\Enum\OAuthProviderEnum $provider, string $providerId): ?User
    {
        return match ($provider) {
            \App\Enum\OAuthProviderEnum::GOOGLE => $this->findByGoogleId($providerId),
            \App\Enum\OAuthProviderEnum::APPLE => $this->findByAppleId($providerId),
        };
    }

    /**
     * Look up a non-soft-deleted user by their Telegram chat ID. Useful for
     * inbound webhook flows that need to identify who is messaging the bot.
     * Returns null if the chat isn't linked or the user has been soft-deleted.
     */
    public function findOneByTelegramChatId(string $chatId): ?User
    {
        return $this->findOneBy(['telegramChatId' => $chatId, 'deletedAt' => null]);
    }

    /** Live accounts — the retained half of the user churn denominator. */
    public function countLive(): int
    {
        return $this->count(['deletedAt' => null]);
    }

    public function countDeletedSince(\DateTimeInterface $since): int
    {
        return (int) $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.deletedAt IS NOT NULL')
            ->andWhere('u.deletedAt >= :since')
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Soft-deleted accounts, newest deletion first. Bounded — the churn timeline
     * shows recent history, not the whole archive.
     *
     * @return User[]
     */
    public function findDeletedSince(\DateTimeInterface $since, int $limit = 500): array
    {
        return $this->createQueryBuilder('u')
            ->where('u.deletedAt IS NOT NULL')
            ->andWhere('u.deletedAt >= :since')
            ->setParameter('since', $since)
            ->orderBy('u.deletedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Account deletions bucketed by calendar month (`YYYY-MM`). Months with no
     * deletion are absent — callers zero-fill.
     *
     * @return array<string, int>
     */
    public function countDeletedByMonthSince(\DateTimeInterface $since): array
    {
        /** @var array<int, array{month: string|null, c: int|string}> $rows */
        $rows = $this->createQueryBuilder('u')
            ->select('SUBSTRING(u.deletedAt, 1, 7) AS month, COUNT(u.id) AS c')
            ->where('u.deletedAt IS NOT NULL')
            ->andWhere('u.deletedAt >= :since')
            ->setParameter('since', $since)
            ->groupBy('month')
            ->getQuery()
            ->getArrayResult();

        $out = [];
        foreach ($rows as $row) {
            $month = (string) ($row['month'] ?? '');
            if ($month !== '') {
                $out[$month] = (int) $row['c'];
            }
        }

        return $out;
    }
}

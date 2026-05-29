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
}

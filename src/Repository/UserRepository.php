<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
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
}

<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\TapNonceRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Single-use bookkeeping for the tap verifier — device nonces and, here, the
 * anti-passback cooldown on a pass id.
 *
 * A database row rather than the bundle's cache-backed store on purpose: PSR-6
 * has no compare-and-set, so two taps arriving together can both see an empty
 * slot and both be admitted. A unique constraint cannot.
 *
 * Rows are claimed with an INSERT that either succeeds or violates the unique
 * key; expired rows are swept rather than checked, so a claim is one write.
 */
#[ORM\Table(name: 'daily_brew_tap_nonces')]
#[ORM\UniqueConstraint(name: 'uniq_tap_nonce', columns: ['scope', 'token'])]
#[ORM\Index(name: 'idx_tap_nonce_expiry', columns: ['expires_at'])]
#[ORM\Entity(repositoryClass: TapNonceRepository::class)]
class TapNonce
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $scope;

    #[ORM\Column(length: 128)]
    private string $token;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private DateTimeImmutable $expiresAt;

    public function getId(): ?int { return $this->id; }

    public function getScope(): string { return $this->scope; }
    public function setScope(string $scope): static { $this->scope = $scope; return $this; }

    public function getToken(): string { return $this->token; }
    public function setToken(string $token): static { $this->token = $token; return $this; }

    public function getExpiresAt(): DateTimeImmutable { return $this->expiresAt; }
    public function setExpiresAt(DateTimeImmutable $expiresAt): static { $this->expiresAt = $expiresAt; return $this; }
}

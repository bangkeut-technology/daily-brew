<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\ApiTokenRepository;
use App\Service\DateService;
use App\Util\TokenGenerator;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

/**
 * API token for external integrations (e.g. BasilBook).
 *
 * The raw token is shown once on creation. Only the hash is stored.
 * A short prefix is kept for display/identification.
 */
#[ORM\Table(name: 'daily_brew_api_tokens')]
#[ORM\Entity(repositoryClass: ApiTokenRepository::class)]
class ApiToken
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 36, unique: true)]
    private string $publicId;

    /** First 8 characters of the raw token — for owner identification in the UI. */
    #[ORM\Column(length: 8)]
    private string $prefix;

    /** SHA-256 hash of the full token. */
    #[ORM\Column(length: 64, unique: true)]
    private string $tokenHash;

    /** Human-readable label (e.g. "BasilBook production"). */
    #[ORM\Column(length: 100)]
    private string $name;

    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Workspace $workspace;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?DateTimeImmutable $lastUsedAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?DateTimeImmutable $revokedAt = null;

    #[ORM\Column]
    private DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->publicId = TokenGenerator::generatePublicId();
        $this->createdAt = DateService::now();
    }

    // ── Factory ─────────────────────────────────────────────────

    /**
     * Create a new token for a workspace.
     *
     * @return array{entity: self, plainToken: string} — the plain token is returned only here
     */
    public static function create(Workspace $workspace, string $name): array
    {
        $plain = 'db_' . TokenGenerator::generate(
            numeric: true,
            majuscule: true,
            minuscule: true,
            symbols: false,
            length: 45,
        );

        $entity = new self();
        $entity->workspace = $workspace;
        $entity->name = $name;
        $entity->prefix = substr($plain, 0, 8);
        $entity->tokenHash = hash('sha256', $plain);

        return ['entity' => $entity, 'plainToken' => $plain];
    }

    // ── Verification ────────────────────────────────────────────

    public static function hashToken(string $plainToken): string
    {
        return hash('sha256', $plainToken);
    }

    public function isActive(): bool
    {
        return $this->revokedAt === null;
    }

    // ── Getters / Setters ───────────────────────────────────────

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPublicId(): string
    {
        return $this->publicId;
    }

    public function getPrefix(): string
    {
        return $this->prefix;
    }

    public function getTokenHash(): string
    {
        return $this->tokenHash;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getWorkspace(): Workspace
    {
        return $this->workspace;
    }

    public function getLastUsedAt(): ?DateTimeImmutable
    {
        return $this->lastUsedAt;
    }

    public function setLastUsedAt(?DateTimeImmutable $lastUsedAt): static
    {
        $this->lastUsedAt = $lastUsedAt;
        return $this;
    }

    public function getRevokedAt(): ?DateTimeImmutable
    {
        return $this->revokedAt;
    }

    public function revoke(): static
    {
        $this->revokedAt = DateService::now();
        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }
}

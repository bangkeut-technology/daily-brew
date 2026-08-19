<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\WorkspaceIssuerKeyRepository;
use App\Service\DateService;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * The ECDSA P-256 keypair a workspace signs its cards with.
 *
 * **One keypair per workspace, never platform-wide.** The verifier already
 * scopes issuer keys by audience, and a leaked platform key would mint valid
 * cards for every customer on the system.
 *
 * Several rows may exist for one workspace: rotation mints a new key and
 * retires the old one, and the retired *public* key keeps being published until
 * every card signed with it has expired or been revoked. Retiring is therefore
 * not deleting — a deleted public key bricks every card in the drawer.
 *
 * The private key is encrypted at rest with {@see \App\Service\Integration\SecretCipher},
 * the same mechanism protecting API token signing secrets: a database dump
 * alone yields nothing, because the key lives in the environment.
 *
 * @see docs/card-checkin.md
 */
#[ORM\Table(name: 'daily_brew_workspace_issuer_keys')]
#[ORM\Index(name: 'idx_issuer_key_workspace', columns: ['workspace_id'])]
#[ORM\Entity(repositoryClass: WorkspaceIssuerKeyRepository::class)]
class WorkspaceIssuerKey
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    /** PEM SubjectPublicKeyInfo. Published to terminals; not a secret. */
    #[ORM\Column(type: Types::TEXT)]
    private string $publicKeyPem;

    /** Encrypted PEM private key — base64 of nonce || ciphertext. */
    #[ORM\Column(type: Types::TEXT)]
    private string $privateKeyEncrypted;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private DateTimeImmutable $createdAt;

    /** Set when rotated out. The public key is still served; signing stops. */
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $retiredAt = null;

    public function __construct()
    {
        $this->createdAt = DateService::now();
    }

    public function getId(): ?int { return $this->id; }

    public function getWorkspace(): ?Workspace { return $this->workspace; }
    public function setWorkspace(?Workspace $workspace): static { $this->workspace = $workspace; return $this; }

    public function getPublicKeyPem(): string { return $this->publicKeyPem; }
    public function setPublicKeyPem(string $pem): static { $this->publicKeyPem = $pem; return $this; }

    public function getPrivateKeyEncrypted(): string { return $this->privateKeyEncrypted; }
    public function setPrivateKeyEncrypted(string $ciphertext): static { $this->privateKeyEncrypted = $ciphertext; return $this; }

    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }

    public function getRetiredAt(): ?DateTimeImmutable { return $this->retiredAt; }
    public function isRetired(): bool { return $this->retiredAt !== null; }

    public function retire(): static
    {
        $this->retiredAt ??= DateService::now();

        return $this;
    }
}

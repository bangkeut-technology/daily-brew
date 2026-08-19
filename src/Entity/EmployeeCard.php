<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\EmployeeCardRepository;
use App\Service\DateService;
use App\Util\TokenGenerator;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * A physical card an employee taps at a kiosk to punch, for staff who have no
 * phone and no account.
 *
 * `publicId` **is** the protocol's `passId` — the 12-byte identifier signed
 * into the card. That is why this is the card's id and not the employee's: a
 * lost card is revoked and replaced for the same person, and the two must stay
 * distinguishable in an audit trail. It also keeps a stable employee identifier
 * off an object that gets left in a taxi.
 *
 * `notBefore` / `notAfter` mirror the window that was signed. The signature is
 * authoritative — these columns exist so the console can show and reason about
 * a card without decoding it.
 *
 * Revocation is soft and is the only way to take a card back: the pass carries
 * its own authority in a signature the issuer cannot reach, so the door has to
 * be told. A revoked row is kept — it is the record of a card that existed.
 *
 * @see docs/card-checkin.md
 */
#[ORM\Table(name: 'daily_brew_employee_cards')]
#[ORM\UniqueConstraint(name: 'uniq_employee_card_public_id', columns: ['public_id'])]
#[ORM\Index(name: 'idx_employee_card_workspace', columns: ['workspace_id'])]
#[ORM\Index(name: 'idx_employee_card_employee', columns: ['employee_id'])]
#[ORM\Entity(repositoryClass: EmployeeCardRepository::class)]
class EmployeeCard
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /** The protocol's passId. 12 chars from the public-id alphabet. */
    #[ORM\Column(length: 36)]
    private string $publicId;

    #[ORM\ManyToOne(targetEntity: Employee::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Employee $employee = null;

    /**
     * Denormalised from the employee: revocation is looked up by
     * (passId, audienceId) on the tap path, and that must not need a join.
     */
    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    /** "Blue card", "Card #4" — so an owner can tell two cards apart. */
    #[ORM\Column(length: 100)]
    private string $label;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private DateTimeImmutable $notBefore;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private DateTimeImmutable $notAfter;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private DateTimeImmutable $createdAt;

    #[ORM\Column(length: 180, nullable: true)]
    private ?string $issuedByEmail = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $revokedAt = null;

    #[ORM\Column(length: 180, nullable: true)]
    private ?string $revokedByEmail = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $revokeReason = null;

    public function __construct()
    {
        $this->publicId = TokenGenerator::generatePublicId();
        $this->createdAt = DateService::now();
    }

    public function getId(): ?int { return $this->id; }

    public function getPublicId(): string { return $this->publicId; }

    public function getEmployee(): ?Employee { return $this->employee; }
    public function setEmployee(?Employee $employee): static { $this->employee = $employee; return $this; }

    public function getWorkspace(): ?Workspace { return $this->workspace; }
    public function setWorkspace(?Workspace $workspace): static { $this->workspace = $workspace; return $this; }

    public function getLabel(): string { return $this->label; }
    public function setLabel(string $label): static { $this->label = $label; return $this; }

    public function getNotBefore(): DateTimeImmutable { return $this->notBefore; }
    public function setNotBefore(DateTimeImmutable $notBefore): static { $this->notBefore = $notBefore; return $this; }

    public function getNotAfter(): DateTimeImmutable { return $this->notAfter; }
    public function setNotAfter(DateTimeImmutable $notAfter): static { $this->notAfter = $notAfter; return $this; }

    public function getCreatedAt(): DateTimeImmutable { return $this->createdAt; }

    public function getIssuedByEmail(): ?string { return $this->issuedByEmail; }
    public function setIssuedByEmail(?string $email): static { $this->issuedByEmail = $email; return $this; }

    public function getRevokedAt(): ?DateTimeImmutable { return $this->revokedAt; }
    public function getRevokedByEmail(): ?string { return $this->revokedByEmail; }
    public function getRevokeReason(): ?string { return $this->revokeReason; }

    public function isRevoked(): bool { return $this->revokedAt !== null; }

    public function revoke(?string $byEmail, string $reason): static
    {
        $this->revokedAt = DateService::now();
        $this->revokedByEmail = $byEmail;
        $this->revokeReason = $reason;

        return $this;
    }

    /** Expired or revoked — either way the door will refuse it. */
    public function isUsable(DateTimeImmutable $at): bool
    {
        return !$this->isRevoked() && $at >= $this->notBefore && $at <= $this->notAfter;
    }
}

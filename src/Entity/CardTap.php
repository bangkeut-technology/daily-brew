<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\CardTapRepository;
use App\Service\DateService;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * One accepted tap, recorded before the check-in is applied.
 *
 * This table is the replay guard, and it is not optional. An issued pass never
 * consumes the terminal nonce and carries no signed tap timestamp, so a kiosk
 * replaying its offline queue twice verifies twice — and a second tap is read
 * by `CheckinService` as a **check-out**, so an unguarded re-submission would
 * close everyone's shift rather than merely duplicating rows.
 *
 * The unique key is (passId, terminalId, tappedAt): the same card, at the same
 * door, at the same recorded instant is the same tap however many times it
 * arrives.
 *
 * @see docs/card-checkin.md
 */
#[ORM\Table(name: 'daily_brew_card_taps')]
#[ORM\UniqueConstraint(name: 'uniq_card_tap', columns: ['pass_id', 'terminal_id', 'tapped_at'])]
#[ORM\Index(name: 'idx_card_tap_workspace', columns: ['workspace_id'])]
#[ORM\Entity(repositoryClass: CardTapRepository::class)]
class CardTap
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /** The card's publicId, as presented. Kept even if the card is later deleted. */
    #[ORM\Column(length: 36)]
    private string $passId;

    #[ORM\Column(length: 64)]
    private string $terminalId;

    /** The kiosk's own recorded instant — not the server's receive time. */
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private DateTimeImmutable $tappedAt;

    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    #[ORM\ManyToOne(targetEntity: EmployeeCard::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?EmployeeCard $card = null;

    /** True when the kiosk replayed this from its offline queue. */
    #[ORM\Column]
    private bool $offlineBatch = false;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private DateTimeImmutable $recordedAt;

    public function __construct()
    {
        $this->recordedAt = DateService::now();
    }

    public function getId(): ?int { return $this->id; }

    public function getPassId(): string { return $this->passId; }
    public function setPassId(string $passId): static { $this->passId = $passId; return $this; }

    public function getTerminalId(): string { return $this->terminalId; }
    public function setTerminalId(string $terminalId): static { $this->terminalId = $terminalId; return $this; }

    public function getTappedAt(): DateTimeImmutable { return $this->tappedAt; }
    public function setTappedAt(DateTimeImmutable $tappedAt): static { $this->tappedAt = $tappedAt; return $this; }

    public function getWorkspace(): ?Workspace { return $this->workspace; }
    public function setWorkspace(?Workspace $workspace): static { $this->workspace = $workspace; return $this; }

    public function getCard(): ?EmployeeCard { return $this->card; }
    public function setCard(?EmployeeCard $card): static { $this->card = $card; return $this; }

    public function isOfflineBatch(): bool { return $this->offlineBatch; }
    public function setOfflineBatch(bool $offlineBatch): static { $this->offlineBatch = $offlineBatch; return $this; }

    public function getRecordedAt(): DateTimeImmutable { return $this->recordedAt; }
}

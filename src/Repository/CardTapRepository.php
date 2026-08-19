<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\CardTap;
use App\Entity\EmployeeCard;
use App\Entity\Workspace;
use App\Service\DateService;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractRepository<CardTap>
 */
class CardTapRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CardTap::class);
    }

    /**
     * Record a tap, or report that this exact tap is already on file.
     *
     * This is the replay guard. A kiosk replaying its offline queue twice
     * verifies twice — an issued pass consumes no nonce and carries no signed
     * tap time — and a second tap reads as a *check-out*, so without this a
     * re-submission closes everyone's shift.
     *
     * Written through DBAL rather than the ORM: a unique-key violation inside
     * `EntityManager::flush()` closes the manager, and "already recorded" is a
     * routine answer on this path, not a fatal one — the check-in that follows
     * still needs a working manager.
     */
    public function claim(
        string $passId,
        string $terminalId,
        \DateTimeImmutable $tappedAt,
        Workspace $workspace,
        ?EmployeeCard $card,
        bool $offlineBatch,
    ): bool {
        try {
            $this->getEntityManager()->getConnection()->executeStatement(
                'INSERT INTO daily_brew_card_taps '
                . '(pass_id, terminal_id, tapped_at, workspace_id, card_id, offline_batch, recorded_at) '
                . 'VALUES (:pass, :terminal, :tapped, :workspace, :card, :offline, :recorded)',
                [
                    'pass' => $passId,
                    'terminal' => $terminalId,
                    'tapped' => $tappedAt->format('Y-m-d H:i:s'),
                    'workspace' => $workspace->getId(),
                    'card' => $card?->getId(),
                    'offline' => $offlineBatch ? 1 : 0,
                    'recorded' => DateService::now()->format('Y-m-d H:i:s'),
                ],
            );
        } catch (UniqueConstraintViolationException) {
            return false;
        }

        return true;
    }
}

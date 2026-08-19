<?php

declare(strict_types=1);

namespace App\Service\Card;

use App\Entity\Employee;
use App\Entity\EmployeeCard;
use App\Entity\Workspace;
use App\Entity\WorkspaceIssuerKey;
use App\Repository\EmployeeCardRepository;
use App\Repository\WorkspaceIssuerKeyRepository;
use App\Service\DateService;
use App\Service\Integration\SecretCipher;
use Bangkeut\Tap\Issuance\IssuedPass;
use Bangkeut\Tap\Issuance\PassIssuer;
use Bangkeut\Tap\Signature\Es256KeyPair;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Mints and revokes the cards employees tap at a kiosk.
 *
 * The pass bytes are returned **once**, at issuance, and never stored: they are
 * derived entirely from the card row plus the workspace's signing key, so
 * keeping a copy would add a second place to leak them and no capability. A
 * card that was never written to a tag is re-issued, not recovered.
 *
 * @see docs/card-checkin.md
 */
final readonly class CardIssuanceService
{
    /**
     * How long a new card is good for. Cards are long-lived — an employee keeps
     * one for years — and early death is handled by revocation, not by a short
     * window that would have every restaurant re-issuing the whole drawer.
     */
    private const string DEFAULT_VALIDITY = '+3 years';

    public function __construct(
        private EmployeeCardRepository $cards,
        private WorkspaceIssuerKeyRepository $issuerKeys,
        private SecretCipher $cipher,
    ) {
    }

    /**
     * Issue a card for an employee and return it with the bytes to write to the
     * tag. The caller shows those once and forgets them.
     *
     * @return array{card: EmployeeCard, pass: IssuedPass}
     */
    public function issue(
        Workspace $workspace,
        Employee $employee,
        string $label,
        ?string $issuedByEmail,
        ?\DateTimeImmutable $notAfter = null,
    ): array {
        if ($employee->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new BadRequestHttpException('That employee does not belong to this workspace.');
        }

        $label = trim($label);
        if ($label === '') {
            throw new BadRequestHttpException('A card label is required.');
        }
        if (mb_strlen($label) > 100) {
            throw new BadRequestHttpException('A card label may be at most 100 characters.');
        }

        $notBefore = DateService::now();
        $notAfter ??= $notBefore->modify(self::DEFAULT_VALIDITY);
        if ($notAfter <= $notBefore) {
            throw new BadRequestHttpException('A card must expire after it starts.');
        }

        $card = (new EmployeeCard())
            ->setEmployee($employee)
            ->setWorkspace($workspace)
            ->setLabel($label)
            ->setNotBefore($notBefore)
            ->setNotAfter($notAfter)
            ->setIssuedByEmail($issuedByEmail);

        // Sign before persisting: PassIssuer refuses anything that could never
        // be admitted — an inverted window, a timestamp outside the wire
        // format's uint32 — and a card row with no usable pass is worse than no
        // row at all.
        $pass = $this->issuerFor($workspace)->issue(
            passId: $card->getPublicId(),
            audienceId: (string) $workspace->getPublicId(),
            notBefore: $notBefore,
            notAfter: $notAfter,
        );

        $this->cards->update($card);

        return ['card' => $card, 'pass' => $pass];
    }

    public function revoke(EmployeeCard $card, ?string $byEmail, string $reason): EmployeeCard
    {
        $reason = trim($reason);
        if ($reason === '') {
            throw new BadRequestHttpException('A reason is required to revoke a card.');
        }
        if (mb_strlen($reason) > 255) {
            throw new BadRequestHttpException('A revoke reason may be at most 255 characters.');
        }
        if ($card->isRevoked()) {
            throw new BadRequestHttpException('That card is already revoked.');
        }

        $card->revoke($byEmail, $reason);
        $this->cards->update($card);

        return $card;
    }

    /**
     * Rotate the workspace's signing key. The old key is retired, not deleted —
     * its public half keeps being served so cards already in pockets still
     * verify until they expire.
     */
    public function rotateKey(Workspace $workspace): WorkspaceIssuerKey
    {
        $current = $this->issuerKeys->findActiveForWorkspace($workspace);
        if ($current !== null) {
            $current->retire();
            $this->issuerKeys->update($current, andFlush: false);
        }

        return $this->mintKey($workspace);
    }

    private function issuerFor(Workspace $workspace): PassIssuer
    {
        $key = $this->issuerKeys->findActiveForWorkspace($workspace) ?? $this->mintKey($workspace);

        return new PassIssuer($this->cipher->decrypt($key->getPrivateKeyEncrypted()));
    }

    private function mintKey(Workspace $workspace): WorkspaceIssuerKey
    {
        $pair = Es256KeyPair::generate();

        $key = (new WorkspaceIssuerKey())
            ->setWorkspace($workspace)
            ->setPublicKeyPem($pair->publicKeyPem)
            ->setPrivateKeyEncrypted($this->cipher->encrypt($pair->privateKeyPem));

        $this->issuerKeys->update($key);

        return $key;
    }
}

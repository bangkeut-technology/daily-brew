<?php

declare(strict_types=1);

namespace App\Service\Card;

use App\Entity\Attendance;
use App\Entity\Workspace;
use App\Repository\CardTapRepository;
use App\Repository\EmployeeCardRepository;
use App\Service\Checkin\KioskCheckinSettings;
use App\Service\CheckinService;
use App\Service\DateService;
use Bangkeut\Tap\Assertion\AssertionCodec;
use Bangkeut\Tap\Assertion\AssertionKind;
use Bangkeut\Tap\Exception\MalformedAssertion;
use Bangkeut\Tap\TapRequest;
use Bangkeut\TapBundle\TapService;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Turns a verified card tap into an attendance punch.
 *
 * The cryptography is `tap-core`'s: signature, validity window, audience,
 * revocation and anti-passback all happen inside `TapService::verify()`, which
 * also announces the outcome so an audit listener sees every tap. What is left
 * here is everything the library deliberately refuses to know — which employee
 * a pass belongs to, and what a tap *means*.
 *
 * Verification is called directly rather than reacting to `TapVerifiedEvent`
 * because this path answers a kiosk synchronously: the terminal needs to be
 * told, in the same response, whose punch it just recorded. The event still
 * fires for anything that wants to listen.
 *
 * @see docs/card-checkin.md
 */
final readonly class CardTapService
{
    public function __construct(
        private TapService $taps,
        private AssertionCodec $codec,
        private EmployeeCardRepository $cards,
        private CardTapRepository $tapLog,
        private CheckinService $checkin,
    ) {
    }

    /**
     * @param string                  $assertionBase64Url the 98 bytes as read off the card
     * @param \DateTimeImmutable|null $tappedAt           the kiosk's own recorded instant
     *
     * @return array{attendance: Attendance, duplicate: bool}
     */
    public function tap(
        Workspace $workspace,
        string $assertionBase64Url,
        string $terminalId,
        string $nonce,
        ?\DateTimeImmutable $tappedAt,
        bool $offlineBatch,
        string $clientIp,
    ): array {
        $terminalId = trim($terminalId);
        if ($terminalId === '') {
            throw new BadRequestHttpException('terminalId is required.');
        }

        try {
            $bytes = $this->codec->fromBase64Url(trim($assertionBase64Url));
        } catch (\Throwable) {
            throw new MalformedAssertion('The assertion is not valid base64url.');
        }

        // Throws a TapException the controller maps to a refusal. Every reason
        // — bad signature, wrong audience, expired, revoked, tapped again too
        // soon — comes back through this one call.
        $result = $this->taps->verify(new TapRequest(
            assertion: $bytes,
            nonce: $nonce,
            terminalId: $terminalId,
            audienceId: (string) $workspace->getPublicId(),
            offlineBatch: $offlineBatch,
        ));

        // A device assertion is not a card. Nothing can currently produce one —
        // no device keys are enrolled — but treating an unexpected kind as
        // "close enough" is how a protocol change becomes a security incident.
        if ($result->kind !== AssertionKind::IssuedPass) {
            throw new BadRequestHttpException('Only issued passes are accepted at a kiosk.');
        }

        $card = $this->cards->findByPassIdAndWorkspacePublicId(
            $result->subjectId,
            (string) $workspace->getPublicId(),
        );
        // The revocation store already refuses an unknown pass id, so reaching
        // this with no card means the two disagree — refuse rather than guess.
        if ($card === null || $card->getEmployee() === null) {
            throw new BadRequestHttpException('That card is not registered here.');
        }

        // The kiosk's clock, not ours. An issued pass carries no signed tap
        // time and the verifier stamps the moment it *ran*, so a queue replayed
        // three hours later would otherwise file every punch at replay time.
        $tappedAt ??= $result->tappedAt;

        // Replay guard, before the punch: the same card at the same door at the
        // same instant is one tap however many times it arrives. Without this a
        // re-submitted offline queue would read as a second tap — a check-out —
        // and close the whole crew's shift.
        $fresh = $this->tapLog->claim(
            passId: $result->subjectId,
            terminalId: $terminalId,
            tappedAt: $tappedAt,
            workspace: $workspace,
            card: $card,
            offlineBatch: $offlineBatch,
        );

        $employee = $card->getEmployee();

        if (!$fresh) {
            // Already recorded. Report what stands rather than punching again.
            $existing = $this->checkin->getStatus($employee);
            if ($existing === null) {
                throw new BadRequestHttpException('That tap was already recorded.');
            }

            return ['attendance' => $existing, 'duplicate' => true];
        }

        $attendance = $this->checkin->checkin(
            employee: $employee,
            clientIp: $clientIp,
            deviceId: $terminalId,
            deviceName: sprintf('Kiosk %s', $terminalId),
            settings: KioskCheckinSettings::forWorkspace($workspace),
            source: CheckinService::SOURCE_CARD,
        );

        return ['attendance' => $attendance, 'duplicate' => false];
    }

    /** Parse the kiosk's `tappedAt`, which is optional but must be sane when sent. */
    public function parseTappedAt(mixed $raw): ?\DateTimeImmutable
    {
        if ($raw === null || $raw === '') {
            return null;
        }
        if (!is_string($raw)) {
            throw new BadRequestHttpException('tappedAt must be an ISO 8601 string.');
        }

        try {
            return DateService::parse($raw)->setTimezone(new \DateTimeZone('UTC'));
        } catch (\Throwable) {
            throw new BadRequestHttpException('tappedAt must be an ISO 8601 string.');
        }
    }
}

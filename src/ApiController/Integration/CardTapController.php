<?php

declare(strict_types=1);

namespace App\ApiController\Integration;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\AttendanceDTO;
use App\Entity\ApiToken;
use App\Entity\Workspace;
use App\Enum\ApiTokenScopeEnum;
use App\Security\ApiTokenAuthenticator;
use App\Service\Card\CardTapService;
use App\Service\PlanService;
use Bangkeut\Tap\Exception\TapException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Card taps from a kiosk terminal.
 *
 * **Two independent credentials, one request.** The terminal proves it is the
 * terminal — a signed request, the same scheme the attendance ingest uses — and
 * the card proves who tapped, with its own signature verified by `tap-core`.
 * Neither substitutes for the other: without terminal authentication anyone who
 * copied a card's 98 bytes could POST them from anywhere, which throws away the
 * "kiosk in a supervised place" control the whole bearer model rests on.
 *
 * Espresso and above, and the workspace must have card check-in switched on.
 *
 * @see docs/card-checkin.md
 */
#[Route('/integrations/card-taps')]
class CardTapController extends AbstractController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly RateLimiterFactory $ingestLimiter,
    ) {
    }

    #[Route('', name: 'integration_card_tap', methods: ['POST'])]
    public function tap(
        Request $request,
        CardTapService $cardTaps,
        PlanService $planService,
    ): JsonResponse {
        $workspace = $request->attributes->get(ApiTokenAuthenticator::ATTR_WORKSPACE);
        $apiToken = $request->attributes->get(ApiTokenAuthenticator::ATTR_TOKEN);
        if (!$workspace instanceof Workspace || !$apiToken instanceof ApiToken) {
            return $this->jsonError('Unauthorized', 401);
        }

        // A bearer key must never punch a clock, however it's scoped: the point
        // of requiring a signature is that the secret doesn't travel.
        if ($request->attributes->get(ApiTokenAuthenticator::ATTR_SIGNED) !== true) {
            return $this->jsonError('This endpoint requires a signed request.', 401);
        }

        // Per key, not per IP: every kiosk in one restaurant shares an address,
        // and the key is the thing we can hold to account.
        $limit = $this->ingestLimiter->create($apiToken->getPublicId())->consume();
        if (!$limit->isAccepted()) {
            $response = $this->jsonError('Rate limit exceeded.', 429);
            $response->headers->set('Retry-After', (string) max(1, $limit->getRetryAfter()->getTimestamp() - time()));

            return $response;
        }

        if (!$apiToken->hasScope(ApiTokenScopeEnum::TapCheckin)) {
            return $this->jsonError('This API token is not allowed to submit card taps.', 403);
        }

        if (!$planService->canUseCardCheckin($workspace)) {
            return $this->jsonError('Card check-in requires an Espresso plan.', 403);
        }

        if (!($workspace->getSetting()?->isCardCheckinEnabled() ?? false)) {
            return $this->jsonError('Card check-in is switched off for this workspace.', 403);
        }

        $body = json_decode($request->getContent(), true);
        if (!is_array($body)) {
            return $this->jsonError('Request body must be a JSON object.', 422);
        }

        $assertion = $body['assertion'] ?? null;
        if (!is_string($assertion) || trim($assertion) === '') {
            return $this->jsonError('assertion is required.', 422);
        }

        $terminalId = $body['terminalId'] ?? null;
        if (!is_string($terminalId)) {
            return $this->jsonError('terminalId is required.', 422);
        }

        // The nonce is unused by the issued-pass path — the verifier consumes it
        // only for device assertions — but the terminal supplies one anyway so
        // the same call site keeps working when phones become credentials.
        $nonce = $body['nonce'] ?? null;
        $nonce = is_string($nonce) ? $nonce : bin2hex(random_bytes(16));

        try {
            $result = $cardTaps->tap(
                workspace: $workspace,
                assertionBase64Url: $assertion,
                terminalId: $terminalId,
                nonce: $nonce,
                tappedAt: $cardTaps->parseTappedAt($body['tappedAt'] ?? null),
                offlineBatch: (bool) ($body['offlineBatch'] ?? false),
                clientIp: $request->getClientIp() ?? '',
            );
        } catch (TapException $refusal) {
            // The reason type says why — expired, revoked, wrong audience,
            // tapped again too soon. A kiosk shows this to the person standing
            // in front of it, so it is deliberately specific: unlike an API key,
            // a card is held by someone who is entitled to know why it failed.
            return new JsonResponse([
                'error' => true,
                'reason' => $this->reasonCode($refusal),
                'message' => $refusal->getMessage(),
            ], 403);
        } catch (HttpException $e) {
            return $this->jsonError($e->getMessage(), $e->getStatusCode());
        }

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

        return $this->jsonSuccess([
            'duplicate' => $result['duplicate'],
            'attendance' => AttendanceDTO::fromEntity($result['attendance'], includeEmployee: true, tz: $wsTz)->toArray(),
        ]);
    }

    /** Stable, machine-readable refusal for a kiosk that has to render it offline. */
    private function reasonCode(TapException $e): string
    {
        $short = (new \ReflectionClass($e))->getShortName();

        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $short) ?? $short);
    }
}

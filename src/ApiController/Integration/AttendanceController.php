<?php

declare(strict_types=1);

namespace App\ApiController\Integration;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\AttendanceDTO;
use App\Entity\ApiToken;
use App\Entity\Employee;
use App\Entity\Workspace;
use App\Enum\ApiTokenScopeEnum;
use App\Exception\AttendanceAlreadyExistsException;
use App\Repository\EmployeeRepository;
use App\Security\ApiTokenAuthenticator;
use App\Service\AttendanceService;
use App\Service\AuditActor;
use App\Service\PlanService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Attendance ingest for external systems — a turnstile, a POS, another HR tool.
 *
 * Writes require a **signed** request (see `RequestSignature`): a bearer key
 * that travels on every request is replayable, and attendance is what payroll
 * gets reconciled against. Reads keep the bearer scheme they shipped with.
 *
 * Validation is not reimplemented here. Everything goes through
 * `AttendanceService::create()`, the same path the console uses — future dates
 * rejected, check-out after check-in, flags recomputed, voided rows resurrected
 * in place. An integration and an operator cannot produce differently-shaped
 * records.
 */
#[Route('/integrations/attendances')]
class AttendanceController extends AbstractController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly RateLimiterFactory $ingestLimiter,
    ) {
    }

    #[Route('', name: 'integration_attendances_create', methods: ['POST'])]
    public function create(
        Request $request,
        AttendanceService $attendanceService,
        EmployeeRepository $employeeRepository,
        PlanService $planService,
    ): JsonResponse {
        $workspace = $request->attributes->get(ApiTokenAuthenticator::ATTR_WORKSPACE);
        $apiToken = $request->attributes->get(ApiTokenAuthenticator::ATTR_TOKEN);
        if (!$workspace instanceof Workspace || !$apiToken instanceof ApiToken) {
            return $this->jsonError('Unauthorized', 401);
        }

        // A bearer key must never write, however it's scoped: the whole point of
        // requiring a signature is that the secret doesn't travel.
        if ($request->attributes->get(ApiTokenAuthenticator::ATTR_SIGNED) !== true) {
            return $this->jsonError('This endpoint requires a signed request.', 401);
        }

        // Per key, not per IP: an integration behind one NAT shouldn't be able to
        // exhaust another's budget, and the key is the thing we can hold to account.
        $limit = $this->ingestLimiter->create($apiToken->getPublicId())->consume();
        if (!$limit->isAccepted()) {
            $response = $this->jsonError('Rate limit exceeded.', 429);
            $response->headers->set('Retry-After', (string) max(1, $limit->getRetryAfter()->getTimestamp() - time()));

            return $response;
        }

        if (!$apiToken->hasScope(ApiTokenScopeEnum::WriteAttendance)) {
            return $this->jsonError('This API token is not allowed to write attendance.', 403);
        }

        if (!$planService->isAtLeastEspresso($workspace)) {
            return $this->jsonError('This feature requires an Espresso plan.', 403);
        }

        $body = json_decode($request->getContent(), true);
        if (!is_array($body)) {
            return $this->jsonError('Request body must be a JSON object.', 422);
        }

        $employee = $this->resolveEmployee($body, $workspace, $employeeRepository);
        if ($employee === null) {
            return $this->jsonError('Employee not found in this workspace.', 404);
        }

        $date = $this->stringField($body, 'date');
        $checkInAt = $this->stringField($body, 'checkInAt');
        $checkOutAt = $this->stringField($body, 'checkOutAt');
        $reason = $this->stringField($body, 'reason') ?? '';

        if ($date === null) {
            return $this->jsonError('date is required (YYYY-MM-DD).', 422);
        }

        try {
            $attendance = $attendanceService->create(
                workspace: $workspace,
                employee: $employee,
                actor: AuditActor::forApiToken($apiToken),
                date: $date,
                checkInAt: $checkInAt,
                checkOutAt: $checkOutAt,
                reason: $reason,
            );
        } catch (AttendanceAlreadyExistsException $e) {
            // Return the record that's in the way rather than a bare conflict: an
            // integration re-sending a day should be able to see what's already
            // there and PATCH it if it really means to overwrite.
            $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

            return new JsonResponse([
                'error' => true,
                'message' => 'An attendance record already exists for this employee and date.',
                'data' => AttendanceDTO::fromEntity($e->existing, includeEmployee: true, tz: $wsTz)->toArray(),
            ], 409);
        } catch (BadRequestHttpException $e) {
            // AttendanceService speaks in 400s for the console; for a machine
            // client these are all "your payload is wrong".
            return $this->jsonError($e->getMessage(), 422);
        }

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

        return $this->jsonCreated(
            AttendanceDTO::fromEntity($attendance, includeEmployee: true, tz: $wsTz)->toArray(),
        );
    }

    /**
     * `employeePublicId` is the stable, immutable identifier and wins when both
     * are sent. `username` is the BasilBook link key — mutable, so it's a
     * convenience for callers that only hold that, not the recommended join.
     *
     * @param array<string, mixed> $body
     */
    private function resolveEmployee(array $body, Workspace $workspace, EmployeeRepository $employees): ?Employee
    {
        $publicId = $this->stringField($body, 'employeePublicId');
        if ($publicId !== null) {
            return $employees->findOneActiveByPublicIdAndWorkspace($publicId, $workspace);
        }

        $username = $this->stringField($body, 'username');
        if ($username !== null) {
            return $employees->findOneActiveByUsernameAndWorkspace($username, $workspace);
        }

        return null;
    }

    /** @param array<string, mixed> $body */
    private function stringField(array $body, string $key): ?string
    {
        $value = $body[$key] ?? null;
        if (!is_string($value)) {
            return null;
        }
        $value = trim($value);

        return $value === '' ? null : $value;
    }
}

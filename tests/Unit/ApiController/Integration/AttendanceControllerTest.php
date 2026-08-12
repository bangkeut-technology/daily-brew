<?php

declare(strict_types=1);

namespace App\Tests\Unit\ApiController\Integration;

use App\ApiController\Integration\AttendanceController;
use App\Entity\ApiToken;
use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\ApiTokenScopeEnum;
use App\Exception\AttendanceAlreadyExistsException;
use App\Repository\EmployeeRepository;
use App\Security\ApiTokenAuthenticator;
use App\Service\AttendanceService;
use App\Service\AuditActor;
use App\Service\PlanService;
use DateTimeImmutable;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\RateLimiter\Storage\InMemoryStorage;

/**
 * The ingest endpoint's gate. Authentication itself lives in the authenticator
 * and the verifier; what's pinned here is what the controller refuses to do
 * even once a caller is through the door.
 */
#[AllowMockObjectsWithoutExpectations]
class AttendanceControllerTest extends TestCase
{
    private AttendanceService&MockObject $attendanceService;
    private EmployeeRepository&MockObject $employees;
    private PlanService&MockObject $plans;

    protected function setUp(): void
    {
        $this->attendanceService = $this->createMock(AttendanceService::class);
        $this->employees = $this->createMock(EmployeeRepository::class);
        $this->plans = $this->createMock(PlanService::class);
        $this->plans->method('isAtLeastEspresso')->willReturn(true);
    }

    public function testCreatesAnAttendanceRecordAttributedToTheApiToken(): void
    {
        $employee = $this->employee();
        $this->employees->method('findOneActiveByPublicIdAndWorkspace')->willReturn($employee);

        $captured = null;
        $this->attendanceService->method('create')->willReturnCallback(
            function (...$args) use (&$captured, $employee) {
                $captured = $args;

                return (new Attendance())->setEmployee($employee)->setDate(new DateTimeImmutable('2026-08-12'));
            },
        );

        $response = $this->invoke(['employeePublicId' => 'emp123456789', 'date' => '2026-08-12', 'checkInAt' => '08:57']);

        $this->assertSame(201, $response['status']);
        // No user is invented for a machine write — the audit names the key.
        $actor = $captured['actor'] ?? $captured[2];
        $this->assertInstanceOf(AuditActor::class, $actor);
        $this->assertNull($actor->user);
        $this->assertSame('api-token:Turnstile', $actor->label);
    }

    public function testRejectsAnUnsignedRequestEvenWithTheWriteScope(): void
    {
        $response = $this->invoke(
            ['employeePublicId' => 'emp123456789', 'date' => '2026-08-12', 'checkInAt' => '08:57'],
            signed: false,
        );

        // The bearer key travels on every request, so it can never authorise a write.
        $this->assertSame(401, $response['status']);
        $this->assertSame('This endpoint requires a signed request.', $response['body']['message']);
    }

    public function testRejectsATokenWithoutTheWriteScope(): void
    {
        $response = $this->invoke(
            ['employeePublicId' => 'emp123456789', 'date' => '2026-08-12', 'checkInAt' => '08:57'],
            scopes: [ApiTokenScopeEnum::ReadAttendance],
        );

        $this->assertSame(403, $response['status']);
    }

    public function testRejectsAWorkspaceBelowEspresso(): void
    {
        $plans = $this->createMock(PlanService::class);
        $plans->method('isAtLeastEspresso')->willReturn(false);
        $this->plans = $plans;

        $response = $this->invoke(['employeePublicId' => 'emp123456789', 'date' => '2026-08-12', 'checkInAt' => '08:57']);

        $this->assertSame(403, $response['status']);
    }

    public function testUnknownEmployeeIsA404(): void
    {
        $this->employees->method('findOneActiveByPublicIdAndWorkspace')->willReturn(null);

        $response = $this->invoke(['employeePublicId' => 'nope00000000', 'date' => '2026-08-12', 'checkInAt' => '08:57']);

        $this->assertSame(404, $response['status']);
    }

    public function testFallsBackToTheUsernameWhenNoPublicIdIsSent(): void
    {
        $this->employees->expects($this->once())
            ->method('findOneActiveByUsernameAndWorkspace')
            ->with('john_doe')
            ->willReturn($this->employee());
        $this->attendanceService->method('create')->willReturn(
            (new Attendance())->setEmployee($this->employee())->setDate(new DateTimeImmutable('2026-08-12')),
        );

        $response = $this->invoke(['username' => 'john_doe', 'date' => '2026-08-12', 'checkInAt' => '08:57']);

        $this->assertSame(201, $response['status']);
    }

    public function testMissingDateIsAValidationErrorNotAServerError(): void
    {
        $this->employees->method('findOneActiveByPublicIdAndWorkspace')->willReturn($this->employee());

        $response = $this->invoke(['employeePublicId' => 'emp123456789', 'checkInAt' => '08:57']);

        $this->assertSame(422, $response['status']);
    }

    public function testServiceValidationFailuresBecome422ForAMachineClient(): void
    {
        $this->employees->method('findOneActiveByPublicIdAndWorkspace')->willReturn($this->employee());
        $this->attendanceService->method('create')
            ->willThrowException(new BadRequestHttpException('Cannot add attendance for a future date.'));

        $response = $this->invoke(['employeePublicId' => 'emp123456789', 'date' => '2027-01-01', 'checkInAt' => '08:57']);

        $this->assertSame(422, $response['status']);
        $this->assertSame('Cannot add attendance for a future date.', $response['body']['message']);
    }

    public function testDuplicateDayReturnsTheExistingRecordSoTheClientCanPatchIt(): void
    {
        $employee = $this->employee();
        $this->employees->method('findOneActiveByPublicIdAndWorkspace')->willReturn($employee);

        $existing = (new Attendance())
            ->setEmployee($employee)
            ->setDate(new DateTimeImmutable('2026-08-12'))
            ->setCheckInAt(new DateTimeImmutable('2026-08-12 09:15:00'));
        $this->attendanceService->method('create')
            ->willThrowException(new AttendanceAlreadyExistsException($existing));

        $response = $this->invoke(['employeePublicId' => 'emp123456789', 'date' => '2026-08-12', 'checkInAt' => '08:57']);

        $this->assertSame(409, $response['status']);
        // Not a bare conflict: the caller gets what's in the way.
        $this->assertSame('2026-08-12', $response['body']['data']['date']);
    }

    public function testMalformedJsonBodyIsRejected(): void
    {
        $response = $this->invoke(rawBody: 'not json at all');

        $this->assertSame(422, $response['status']);
    }

    private function employee(): Employee
    {
        return (new Employee())->setFirstName('John')->setLastName('Doe')->setUsername('john_doe');
    }

    /**
     * @param  array<string, mixed>|null       $body
     * @param  array<int, ApiTokenScopeEnum>   $scopes
     * @return array{status: int, body: array<string, mixed>}
     */
    private function invoke(
        ?array $body = null,
        bool $signed = true,
        array $scopes = [ApiTokenScopeEnum::WriteAttendance],
        ?string $rawBody = null,
    ): array {
        $workspace = (new Workspace())
            ->setName('The Daily Grind')
            ->setOwner((new User())->setEmail('owner@dailybrew.work'));

        ['entity' => $token] = ApiToken::create($workspace, 'Turnstile', $scopes);

        $request = new Request(content: $rawBody ?? json_encode($body ?? []));
        $request->attributes->set(ApiTokenAuthenticator::ATTR_WORKSPACE, $workspace);
        $request->attributes->set(ApiTokenAuthenticator::ATTR_TOKEN, $token);
        $request->attributes->set(ApiTokenAuthenticator::ATTR_SIGNED, $signed);

        $limiter = new RateLimiterFactory(
            ['id' => 'test_ingest', 'policy' => 'sliding_window', 'limit' => 120, 'interval' => '1 minute'],
            new InMemoryStorage(),
        );

        $response = (new AttendanceController($limiter))->create(
            $request,
            $this->attendanceService,
            $this->employees,
            $this->plans,
        );

        return [
            'status' => $response->getStatusCode(),
            'body' => json_decode((string) $response->getContent(), true) ?? [],
        ];
    }
}

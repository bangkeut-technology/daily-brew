<?php

declare(strict_types=1);

namespace App\Tests\Unit\ApiController\BasilBook;

use App\ApiController\BasilBook\AttendanceController;
use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Workspace;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Service\PlanService;
use DateTimeImmutable;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;

/**
 * The BasilBook pull groups attendance per employee and exposes a stable
 * `publicId` alongside the mutable `username` so consumers can key off an
 * identifier that survives a username rename. These tests pin that contract.
 *
 * The controller's list() reads its workspace from a request attribute (set by
 * BasilBookApiKeyAuthenticator) and calls no container-bound helpers, so it can
 * be exercised as a plain unit with mocked repositories.
 */
#[AllowMockObjectsWithoutExpectations]
class AttendanceControllerTest extends TestCase
{
    public function testResponseExposesStableEmployeePublicId(): void
    {
        $workspace = (new Workspace())->setName('The Daily Grind');
        $emp = $this->withId((new Employee())
            ->setFirstName('John')
            ->setLastName('Doe')
            ->setUsername('john_doe'), 1);

        $data = $this->invoke($workspace, [$emp], []);

        $this->assertCount(1, $data['employees']);
        $employee = $data['employees'][0];
        $this->assertArrayHasKey('publicId', $employee);
        $this->assertSame($emp->getPublicId(), $employee['publicId']);
        $this->assertSame('john_doe', $employee['username']);
    }

    public function testPublicIdIsPresentAlongsideAttendanceRecordsButNotPerRecord(): void
    {
        $workspace = (new Workspace())->setName('The Daily Grind');
        $emp = $this->withId((new Employee())
            ->setFirstName('John')
            ->setLastName('Doe')
            ->setUsername('john_doe'), 1);

        $attendance = (new Attendance())
            ->setEmployee($emp)
            ->setDate(new DateTimeImmutable('2026-04-02'))
            ->setCheckInAt(new DateTimeImmutable('2026-04-02 08:02:00'));

        $data = $this->invoke($workspace, [$emp], [$attendance]);

        $employee = $data['employees'][0];
        $this->assertSame($emp->getPublicId(), $employee['publicId']);
        $this->assertCount(1, $employee['records']);
        // publicId is an employee-level identifier, never duplicated per record.
        $this->assertArrayNotHasKey('publicId', $employee['records'][0]);
    }

    /**
     * Entities aren't persisted in a unit test, so getId() is null and the
     * controller would use null as an array key (a deprecation the suite fails
     * on). Stamp a real id via reflection to mirror a hydrated entity.
     *
     * @template T of object
     *
     * @param T $entity
     *
     * @return T
     */
    private function withId(object $entity, int $id): object
    {
        (new \ReflectionProperty($entity, 'id'))->setValue($entity, $id);

        return $entity;
    }

    /**
     * @param list<Employee>   $employees
     * @param list<Attendance> $attendances
     *
     * @return array<string, mixed>
     */
    private function invoke(Workspace $workspace, array $employees, array $attendances): array
    {
        $request = new Request(query: ['from' => '2026-04-01', 'to' => '2026-04-30']);
        $request->attributes->set('_basilbook_workspace', $workspace);

        $employeeRepo = $this->createMock(EmployeeRepository::class);
        $employeeRepo->method('findWithUsernameByWorkspace')->willReturn($employees);

        $attendanceRepo = $this->createMock(AttendanceRepository::class);
        $attendanceRepo->method('findByWorkspaceAndDateRange')->willReturn($attendances);

        $planService = $this->createMock(PlanService::class);
        $planService->method('isAtLeastEspresso')->willReturn(true);

        $response = (new AttendanceController())->list($request, $attendanceRepo, $employeeRepo, $planService);

        return json_decode((string) $response->getContent(), true);
    }
}

<?php

declare(strict_types=1);

namespace App\ApiController\BasilBook;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\Workspace;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Service\DateService;
use App\Service\PlanService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * External API for BasilBook to retrieve attendance data.
 *
 * Authenticated via X-Api-Key header (BasilBookApiKeyAuthenticator).
 * Only returns employees with a username (the BasilBook linking field).
 * Requires Espresso plan.
 */
#[Route('/basilbook')]
class AttendanceController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/attendances', name: 'basilbook_attendances', methods: ['GET'])]
    public function list(
        Request $request,
        AttendanceRepository $attendanceRepository,
        EmployeeRepository $employeeRepository,
        PlanService $planService,
    ): JsonResponse {
        /** @var Workspace $workspace */
        $workspace = $request->attributes->get('_basilbook_workspace');
        if ($workspace === null) {
            return $this->jsonError('Unauthorized', 401);
        }

        // BasilBook integration requires Espresso plan (username field is Espresso-only)
        if (!$planService->isAtLeastEspresso($workspace)) {
            return $this->jsonError('This feature requires an Espresso plan.', 403);
        }

        // Validate date range
        $fromStr = $request->query->get('from');
        $toStr = $request->query->get('to');

        if ($fromStr === null || $toStr === null) {
            return $this->jsonError('Both "from" and "to" query parameters are required (YYYY-MM-DD).', 422);
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fromStr) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $toStr)) {
            return $this->jsonError('Dates must be in YYYY-MM-DD format.', 422);
        }

        $from = DateService::parse($fromStr);
        $to = DateService::parse($toStr);

        if ($from > $to) {
            return $this->jsonError('"from" must be before or equal to "to".', 422);
        }

        // Cap range to 93 days (~ 3 months) to prevent abuse
        $daysDiff = (int) $from->diff($to)->days;
        if ($daysDiff > 93) {
            return $this->jsonError('Date range cannot exceed 93 days.', 422);
        }

        // Get employees with usernames (BasilBook linking field)
        $employees = $employeeRepository->findWithUsernameByWorkspace($workspace);
        if (empty($employees)) {
            return $this->jsonSuccess(['employees' => [], 'from' => $fromStr, 'to' => $toStr]);
        }

        // Build employee lookup by ID
        $employeeMap = [];
        foreach ($employees as $emp) {
            $employeeMap[$emp->getId()] = $emp;
        }

        // Fetch attendance records for the period
        $attendances = $attendanceRepository->findByWorkspaceAndDateRange(
            $workspace,
            DateService::mutableParse($fromStr),
            DateService::mutableParse($toStr),
        );

        // Format times in workspace timezone
        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $formatTime = static function (?\DateTimeInterface $dt) use ($wsTz): ?string {
            if ($dt === null) {
                return null;
            }
            return \DateTimeImmutable::createFromInterface($dt)->setTimezone($wsTz)->format('H:i');
        };

        // Group attendance by employee username
        $result = [];
        foreach ($employees as $emp) {
            $result[$emp->getUsername()] = [
                'username' => $emp->getUsername(),
                'name' => $emp->getName(),
                'shiftName' => $emp->getShift()?->getName(),
                'records' => [],
            ];
        }

        foreach ($attendances as $attendance) {
            $emp = $attendance->getEmployee();
            // Only include employees that have a username (are in our map)
            if (!isset($employeeMap[$emp->getId()])) {
                continue;
            }

            $username = $employeeMap[$emp->getId()]->getUsername();
            $result[$username]['records'][] = [
                'date' => $attendance->getDate()->format('Y-m-d'),
                'checkInAt' => $formatTime($attendance->getCheckInAt()),
                'checkOutAt' => $formatTime($attendance->getCheckOutAt()),
                'isLate' => $attendance->isLate(),
                'leftEarly' => $attendance->hasLeftEarly(),
            ];
        }

        return $this->jsonSuccess([
            'workspace' => $workspace->getName(),
            'timezone' => $workspace->getSetting()?->getTimezone() ?? 'UTC',
            'from' => $fromStr,
            'to' => $toStr,
            'employees' => array_values($result),
        ]);
    }
}

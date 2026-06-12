<?php

declare(strict_types=1);

namespace App\ApiController\BasilBook;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\EmployeeDTO;
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

        // All active employees — including those without a username. BasilBook
        // wants every employee in the feed so it can reconcile staff it hasn't
        // matched yet; username-less rows carry `username: null` and are joined
        // on the stable `publicId` instead (the documented long-term join key).
        $employees = $employeeRepository->findActiveByWorkspace($workspace);
        if (empty($employees)) {
            return $this->jsonSuccess(['employees' => [], 'from' => $fromStr, 'to' => $toStr]);
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

        // Group attendance per employee, keyed by internal id (the username can
        // be null, so it can't be the array key). Each employee carries the full
        // EmployeeDTO shape (so BasilBook sees the same fields as the console)
        // plus a `records` array of that employee's attendance for the period.
        // PII the external feed doesn't need is stripped.
        $result = [];
        foreach ($employees as $emp) {
            $employee = EmployeeDTO::fromEntity($emp)->toArray();
            unset($employee['linkedUserEmail'], $employee['phoneNumber']);
            $result[$emp->getId()] = $employee + ['records' => []];
        }

        foreach ($attendances as $attendance) {
            $emp = $attendance->getEmployee();
            // Only include attendance for employees in this workspace's feed
            if (!isset($result[$emp->getId()])) {
                continue;
            }

            // Voided rows are soft-deleted — BasilBook should treat them as
            // absent days (omitted), matching the dashboard's stats.
            if ($attendance->isVoided()) {
                continue;
            }

            $result[$emp->getId()]['records'][] = [
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

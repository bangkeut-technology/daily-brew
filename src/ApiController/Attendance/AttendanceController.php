<?php

namespace App\ApiController\Attendance;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\AttendanceDTO;
use App\Entity\Employee;
use App\Entity\User;
use App\Enum\ManagerPermissionEnum;
use App\Exception\AttendanceAlreadyExistsException;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\Attendance\AttendanceExportService;
use App\Service\Attendance\AttendanceRowBuilder;
use App\Service\Attendance\AttendanceSummaryBuilder;
use App\Service\AttendanceService;
use App\Service\DateService;
use App\Service\PlanService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/workspaces/{workspacePublicId}/attendances')]
class AttendanceController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'attendances_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        AttendanceRowBuilder $rowBuilder,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $from = $request->query->get('from', DateService::today($wsTz)->format('Y-m-d'));
        $to = $request->query->get('to', $from);

        $fromDate = DateService::parse($from);
        $toDate = DateService::parse($to);

        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $employee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $canSeeAll = $isOwner || ($employee?->hasManagerPermission(ManagerPermissionEnum::MANAGE_ATTENDANCE) ?? false);

        // Include employees whose active window overlaps the queried range so
        // historical absent/present rows still surface for deactivated staff.
        $activeEmployees = $employeeRepository->findActiveDuringRangeByWorkspace($workspace, $fromDate);
        if (!$canSeeAll && $employee !== null) {
            $empId = $employee->getId();
            $activeEmployees = array_values(array_filter($activeEmployees, fn ($e) => $e->getId() === $empId));
        }

        $rows = $rowBuilder->build($workspace, $activeEmployees, $fromDate, $toDate);
        // Voided rows are tombstones for managers; an employee viewing their own
        // history sees nothing (matches summary/dashboard semantics — "the day
        // didn't happen"). Owner/manager still see the tombstone with badge.
        if (!$canSeeAll) {
            $rows = array_values(array_filter(
                $rows,
                static fn (array $r): bool => ($r['status'] ?? null) !== 'voided',
            ));
        }
        $rows = AttendanceRowBuilder::sortByDateDescStatusName($rows);

        return $this->jsonSuccess($rows);
    }

    /**
     * Excel export of the attendance log for the same date range as list().
     * Espresso+ — owners and managers/employees with view access get their
     * scoped slice (managers see all if `manage_attendance` is granted).
     */
    #[Route('/export.xlsx', name: 'attendances_export_xlsx', methods: ['GET'])]
    public function exportXlsx(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        AttendanceSummaryBuilder $summaryBuilder,
        AttendanceExportService $exportService,
        PlanService $planService,
    ): Response {
        [$workspace, $grid, $from, $to] = $this->resolveExport(
            $workspacePublicId,
            $request,
            $user,
            $workspaceRepository,
            $employeeRepository,
            $summaryBuilder,
            $planService,
        );

        $contents = $exportService->toXlsx($grid, $workspace, $from, $to);

        return $this->binaryResponse(
            $contents,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            $this->exportFilename($workspace, $from, $to, 'xlsx'),
        );
    }

    /**
     * PDF export of the attendance log for the same date range as list().
     * Espresso+, same access model as exportXlsx.
     */
    #[Route('/export.pdf', name: 'attendances_export_pdf', methods: ['GET'])]
    public function exportPdf(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        AttendanceSummaryBuilder $summaryBuilder,
        AttendanceExportService $exportService,
        PlanService $planService,
    ): Response {
        [$workspace, $grid, $from, $to] = $this->resolveExport(
            $workspacePublicId,
            $request,
            $user,
            $workspaceRepository,
            $employeeRepository,
            $summaryBuilder,
            $planService,
        );

        $contents = $exportService->toPdf($grid, $workspace, $from, $to);

        return $this->binaryResponse(
            $contents,
            'application/pdf',
            $this->exportFilename($workspace, $from, $to, 'pdf'),
        );
    }

    /**
     * Shared resolution for both export endpoints: validates workspace,
     * permissions, plan gate, and produces the per-employee/per-day grid for
     * the requested range (plus optional employeePublicId narrowing). The grid
     * is the same shape the summary endpoint returns, so the export mirrors the
     * on-screen Monthly view exactly.
     *
     * @return array{0: \App\Entity\Workspace, 1: list<array<string, mixed>>, 2: string, 3: string}
     */
    private function resolveExport(
        string $workspacePublicId,
        Request $request,
        User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        AttendanceSummaryBuilder $summaryBuilder,
        PlanService $planService,
    ): array {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        if (!$planService->canExportAttendance($workspace)) {
            throw new \Symfony\Component\HttpKernel\Exception\HttpException(
                402,
                'Attendance export requires the Espresso plan',
            );
        }

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $from = $request->query->get('from', DateService::today($wsTz)->format('Y-m-d'));
        $to = $request->query->get('to', $from);

        $fromDate = DateService::parse($from);
        $toDate = DateService::parse($to);

        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $self = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $canSeeAll = $isOwner || ($self?->hasManagerPermission(ManagerPermissionEnum::MANAGE_ATTENDANCE) ?? false);

        $employees = $employeeRepository->findActiveDuringRangeByWorkspace($workspace, $fromDate);
        if (!$canSeeAll && $self !== null) {
            $empId = $self->getId();
            $employees = array_values(array_filter($employees, fn ($e) => $e->getId() === $empId));
        }

        // Optional per-employee narrowing (matches the list endpoint filter).
        $employeePublicId = $request->query->get('employeePublicId');
        if ($employeePublicId !== null && $employeePublicId !== '') {
            $employees = array_values(array_filter(
                $employees,
                fn (Employee $e) => (string) $e->getPublicId() === $employeePublicId,
            ));
        }

        $grid = $summaryBuilder->build($workspace, $fromDate, $toDate, $employees);

        return [$workspace, $grid, $from, $to];
    }

    private function binaryResponse(string $body, string $mime, string $filename): Response
    {
        $response = new Response($body, 200, [
            'Content-Type' => $mime,
            'Content-Length' => (string) strlen($body),
        ]);
        $disposition = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $filename,
        );
        $response->headers->set('Content-Disposition', $disposition);
        return $response;
    }

    private function exportFilename(\App\Entity\Workspace $workspace, string $from, string $to, string $ext): string
    {
        $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $workspace->getName()) ?? 'workspace');
        $slug = trim($slug, '-') ?: 'workspace';
        return sprintf('attendance-%s-%s-to-%s.%s', $slug, $from, $to, $ext);
    }

    /**
     * Monthly attendance summary: returns per-employee, per-day status
     * so owners can see which employees were absent on which days.
     */
    #[Route('/summary', name: 'attendances_summary', methods: ['GET'])]
    public function summary(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        AttendanceSummaryBuilder $summaryBuilder,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $from = $request->query->get('from', DateService::today($wsTz)->format('Y-m-d'));
        $to = $request->query->get('to', $from);

        $fromDate = DateService::parse($from);
        $toDate = DateService::parse($to);

        // Determine which employees to include
        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $selfEmployee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $canSeeAll = $isOwner || ($selfEmployee?->hasManagerPermission(ManagerPermissionEnum::MANAGE_ATTENDANCE) ?? false);

        if (!$canSeeAll) {
            // Viewer sees only their own summary
            $employees = $selfEmployee !== null ? [$selfEmployee] : [];
        } else {
            // See note in list(): include deactivated employees whose active
            // window overlaps the queried range so history is preserved.
            $employees = $employeeRepository->findActiveDuringRangeByWorkspace($workspace, $fromDate);
        }

        return $this->jsonSuccess($summaryBuilder->build($workspace, $fromDate, $toDate, $employees));
    }

    /**
     * Manager/owner override for an existing attendance record. Used to close
     * forgotten check-outs and fix typo'd scan times. Originals are snapshotted
     * on first edit so the raw scan data is never lost.
     */
    #[Route('/{publicId}', name: 'attendances_update', methods: ['PATCH'])]
    public function update(
        string $workspacePublicId,
        string $publicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        AttendanceRepository $attendanceRepository,
        AttendanceService $attendanceService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $attendance = $attendanceRepository->findByPublicId($publicId);
        if ($attendance === null || $attendance->getEmployee()?->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Attendance not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $attendance);

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->jsonError('Invalid JSON body');
        }

        $checkInProvided = array_key_exists('checkInAt', $data);
        $checkOutProvided = array_key_exists('checkOutAt', $data);
        $reason = is_string($data['reason'] ?? null) ? $data['reason'] : '';

        $checkIn = $data['checkInAt'] ?? null;
        $checkOut = $data['checkOutAt'] ?? null;
        if ($checkIn !== null && !is_string($checkIn)) {
            return $this->jsonError('checkInAt must be a HH:MM string or null');
        }
        if ($checkOut !== null && !is_string($checkOut)) {
            return $this->jsonError('checkOutAt must be a HH:MM string or null');
        }

        $attendanceService->override(
            attendance: $attendance,
            actor: $user,
            checkInAt: $checkIn,
            checkOutAt: $checkOut,
            checkInProvided: $checkInProvided,
            checkOutProvided: $checkOutProvided,
            reason: $reason,
        );

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        return $this->jsonSuccess(AttendanceDTO::fromEntity($attendance, includeEmployee: true, tz: $wsTz)->toArray());
    }

    /**
     * Manually record an attendance row (backfill a forgotten scan or a broken-QR
     * day). Owner or a manager with `manage_attendance`. If a row already exists
     * for that employee/date, returns 409 with the existing record so the client
     * can switch to editing it.
     */
    #[Route('', name: 'attendances_create', methods: ['POST'])]
    public function create(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        AttendanceService $attendanceService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_ATTENDANCES, $workspace);

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->jsonError('Invalid JSON body');
        }

        $employeePublicId = is_string($data['employeePublicId'] ?? null) ? $data['employeePublicId'] : '';
        $date = is_string($data['date'] ?? null) ? $data['date'] : '';
        $reason = is_string($data['reason'] ?? null) ? $data['reason'] : '';

        $checkIn = $data['checkInAt'] ?? null;
        $checkOut = $data['checkOutAt'] ?? null;
        if ($checkIn !== null && !is_string($checkIn)) {
            return $this->jsonError('checkInAt must be a HH:MM string or null');
        }
        if ($checkOut !== null && !is_string($checkOut)) {
            return $this->jsonError('checkOutAt must be a HH:MM string or null');
        }

        $employee = $employeeRepository->findByPublicId($employeePublicId);
        if (!$employee instanceof Employee
            || $employee->getWorkspace()?->getId() !== $workspace->getId()
            || $employee->getDeletedAt() !== null) {
            throw new NotFoundHttpException('Employee not found');
        }

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');

        try {
            $attendance = $attendanceService->create(
                workspace: $workspace,
                employee: $employee,
                actor: $user,
                date: $date,
                checkInAt: $checkIn,
                checkOutAt: $checkOut,
                reason: $reason,
            );
        } catch (AttendanceAlreadyExistsException $e) {
            return new JsonResponse([
                'error' => true,
                'message' => $e->getMessage(),
                'code' => 409,
                'existing' => AttendanceDTO::fromEntity($e->existing, includeEmployee: true, tz: $wsTz)->toArray(),
            ], 409);
        }

        return $this->jsonCreated(AttendanceDTO::fromEntity($attendance, includeEmployee: true, tz: $wsTz)->toArray());
    }

    /**
     * Soft-void an attendance row. The row stays in the database (preserving
     * the unique (employee, date) slot and historical times) but is excluded
     * from dashboard stats, the BasilBook export, and is rendered as a
     * tombstone in the list. A subsequent QR scan or manual entry on the same
     * day resurrects it. Owner or a manager with `manage_attendance`.
     */
    #[Route('/{publicId}', name: 'attendances_delete', methods: ['DELETE'])]
    public function delete(
        string $workspacePublicId,
        string $publicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        AttendanceRepository $attendanceRepository,
        AttendanceService $attendanceService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $attendance = $attendanceRepository->findByPublicId($publicId);
        if ($attendance === null || $attendance->getEmployee()?->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Attendance not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::DELETE, $attendance);

        $data = json_decode($request->getContent(), true);
        $reason = is_array($data) && is_string($data['reason'] ?? null) ? $data['reason'] : '';

        $attendanceService->void($attendance, $user, $reason);

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        return $this->jsonSuccess(AttendanceDTO::fromEntity($attendance, includeEmployee: true, tz: $wsTz)->toArray());
    }
}

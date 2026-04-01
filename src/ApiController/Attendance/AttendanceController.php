<?php

namespace App\ApiController\Attendance;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
        AttendanceRepository $attendanceRepository,
        EmployeeRepository $employeeRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $from = $request->query->get('from', \App\Service\DateService::now()->format('Y-m-d'));
        $to = $request->query->get('to', $from);

        $attendances = $attendanceRepository->findByWorkspaceAndDateRange(
            $workspace,
            \App\Service\DateService::mutableParse($from),
            \App\Service\DateService::mutableParse($to),
        );

        // Owners and managers see all attendance; employees see only their own
        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $employee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $isManager = $employee?->isManager() ?? false;
        if (!$isOwner && !$isManager) {
            if ($employee !== null) {
                $employeeId = $employee->getId();
                $attendances = array_filter($attendances, fn ($a) => $a->getEmployee()->getId() === $employeeId);
            }
        }

        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $formatTime = static function (?\DateTimeInterface $dt) use ($tz): ?string {
            if ($dt === null) return null;
            return \DateTimeImmutable::createFromInterface($dt)->setTimezone($tz)->format('H:i');
        };

        return $this->jsonSuccess(array_values(array_map(fn ($a) => [
            'publicId' => (string) $a->getPublicId(),
            'employeePublicId' => (string) $a->getEmployee()->getPublicId(),
            'employeeName' => $a->getEmployee()->getName(),
            'shiftName' => $a->getEmployee()->getShift()?->getName(),
            'date' => $a->getDate()->format('Y-m-d'),
            'checkInAt' => $formatTime($a->getCheckInAt()),
            'checkOutAt' => $formatTime($a->getCheckOutAt()),
            'isLate' => $a->isLate(),
            'leftEarly' => $a->hasLeftEarly(),
        ], $attendances)));
    }
}

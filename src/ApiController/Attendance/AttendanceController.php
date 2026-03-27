<?php

namespace App\ApiController\Attendance;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\AttendanceRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/workspaces/{workspacePublicId}/attendances')]
class AttendanceController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'attendances_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        AttendanceRepository $attendanceRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $from = $request->query->get('from', (new \DateTime())->format('Y-m-d'));
        $to = $request->query->get('to', $from);

        $attendances = $attendanceRepository->findByWorkspaceAndDateRange(
            $workspace,
            new \DateTime($from),
            new \DateTime($to),
        );

        return $this->jsonSuccess(array_map(fn ($a) => [
            'publicId' => (string) $a->getPublicId(),
            'employeePublicId' => (string) $a->getEmployee()->getPublicId(),
            'employeeName' => $a->getEmployee()->getName(),
            'shiftName' => $a->getEmployee()->getShift()?->getName(),
            'date' => $a->getDate()->format('Y-m-d'),
            'checkInAt' => $a->getCheckInAt()?->format('H:i'),
            'checkOutAt' => $a->getCheckOutAt()?->format('H:i'),
            'isLate' => $a->isLate(),
            'leftEarly' => $a->hasLeftEarly(),
        ], $attendances));
    }
}

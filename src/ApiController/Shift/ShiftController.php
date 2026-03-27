<?php

declare(strict_types=1);

namespace App\ApiController\Shift;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\ShiftRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\ShiftService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/workspaces/{workspacePublicId}/shifts')]
class ShiftController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'shifts_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        WorkspaceRepository $workspaceRepository,
        ShiftRepository $shiftRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $shifts = $shiftRepository->findByWorkspace($workspace);

        return $this->jsonSuccess(array_map(fn ($s) => $this->serializeShift($s), $shifts));
    }

    #[Route('', name: 'shifts_create', methods: ['POST'])]
    public function create(
        string $workspacePublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        ShiftService $shiftService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || empty($data['startTime']) || empty($data['endTime'])) {
            return $this->jsonError('Name, startTime, and endTime are required');
        }

        $shift = $shiftService->create(
            $workspace,
            $data['name'],
            \DateTime::createFromFormat('H:i', $data['startTime']),
            \DateTime::createFromFormat('H:i', $data['endTime']),
        );

        return $this->jsonCreated($this->serializeShift($shift));
    }

    #[Route('/{publicId}', name: 'shifts_update', methods: ['PUT'])]
    public function update(
        string $workspacePublicId,
        string $publicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        ShiftRepository $shiftRepository,
        ShiftService $shiftService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $shift = $shiftRepository->findByPublicId($publicId);
        if ($shift === null || $shift->getWorkspace()->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Shift not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        $data = json_decode($request->getContent(), true);

        $shift = $shiftService->update(
            $shift,
            $data['name'] ?? $shift->getName(),
            isset($data['startTime']) ? \DateTime::createFromFormat('H:i', $data['startTime']) : $shift->getStartTime(),
            isset($data['endTime']) ? \DateTime::createFromFormat('H:i', $data['endTime']) : $shift->getEndTime(),
        );

        return $this->jsonSuccess($this->serializeShift($shift));
    }

    #[Route('/{publicId}', name: 'shifts_delete', methods: ['DELETE'])]
    public function delete(
        string $workspacePublicId,
        string $publicId,
        WorkspaceRepository $workspaceRepository,
        ShiftRepository $shiftRepository,
        ShiftService $shiftService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $shift = $shiftRepository->findByPublicId($publicId);
        if ($shift === null || $shift->getWorkspace()->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Shift not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::DELETE, $workspace);

        $shiftService->delete($shift);

        return $this->jsonNoContent();
    }

    private function serializeShift(\App\Entity\Shift $shift): array
    {
        return [
            'publicId' => (string) $shift->getPublicId(),
            'name' => $shift->getName(),
            'startTime' => $shift->getStartTime()?->format('H:i'),
            'endTime' => $shift->getEndTime()?->format('H:i'),
            'graceLateMinutes' => $shift->getGraceLateMinutes(),
            'graceEarlyMinutes' => $shift->getGraceEarlyMinutes(),
            'timeRules' => array_map(fn ($r) => [
                'publicId' => (string) $r->getPublicId(),
                'dayOfWeek' => $r->getDayOfWeek()->value,
                'dayOfWeekLabel' => $r->getDayOfWeek()->label(),
                'startTime' => $r->getStartTime(),
                'endTime' => $r->getEndTime(),
            ], $shift->getTimeRules()->toArray()),
        ];
    }
}

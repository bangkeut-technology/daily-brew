<?php

declare(strict_types=1);

namespace App\ApiController\Shift;

use App\ApiController\Trait\ApiResponseTrait;
use App\Enum\DayOfWeekEnum;
use App\Repository\ShiftRepository;
use App\Repository\ShiftTimeRuleRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\PlanService;
use App\Service\ShiftTimeRuleService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/workspaces/{workspacePublicId}/shifts/{shiftPublicId}/time-rules')]
class ShiftTimeRuleController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'shift_time_rules_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        string $shiftPublicId,
        WorkspaceRepository $workspaceRepository,
        ShiftRepository $shiftRepository,
        ShiftTimeRuleRepository $ruleRepository,
    ): JsonResponse {
        [$workspace, $shift] = $this->resolveWorkspaceAndShift($workspacePublicId, $shiftPublicId, $workspaceRepository, $shiftRepository);
        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $rules = $ruleRepository->findByShift($shift);

        return $this->jsonSuccess(array_map(fn ($r) => [
            'publicId' => (string) $r->getPublicId(),
            'dayOfWeek' => $r->getDayOfWeek()->value,
            'dayOfWeekLabel' => $r->getDayOfWeek()->label(),
            'startTime' => $r->getStartTime(),
            'endTime' => $r->getEndTime(),
        ], $rules));
    }

    #[Route('', name: 'shift_time_rules_create', methods: ['POST'])]
    public function create(
        string $workspacePublicId,
        string $shiftPublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        ShiftRepository $shiftRepository,
        PlanService $planService,
        ShiftTimeRuleService $ruleService,
    ): JsonResponse {
        [$workspace, $shift] = $this->resolveWorkspaceAndShift($workspacePublicId, $shiftPublicId, $workspaceRepository, $shiftRepository);
        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        if (!$planService->canUseShiftTimeRules($workspace)) {
            return $this->jsonError('Per-day shift schedules require the Espresso plan', 402);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['dayOfWeek'], $data['startTime'], $data['endTime'])) {
            return $this->jsonError('dayOfWeek, startTime, and endTime are required');
        }

        $dayOfWeek = DayOfWeekEnum::tryFrom((int) $data['dayOfWeek']);
        if ($dayOfWeek === null) {
            return $this->jsonError('Invalid dayOfWeek — must be 1 (Monday) through 7 (Sunday)');
        }

        $rule = $ruleService->create($shift, $dayOfWeek, $data['startTime'], $data['endTime']);

        return $this->jsonCreated([
            'publicId' => (string) $rule->getPublicId(),
            'dayOfWeek' => $rule->getDayOfWeek()->value,
            'dayOfWeekLabel' => $rule->getDayOfWeek()->label(),
            'startTime' => $rule->getStartTime(),
            'endTime' => $rule->getEndTime(),
        ]);
    }

    #[Route('/{rulePublicId}', name: 'shift_time_rules_update', methods: ['PUT'])]
    public function update(
        string $workspacePublicId,
        string $shiftPublicId,
        string $rulePublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        ShiftRepository $shiftRepository,
        ShiftTimeRuleRepository $ruleRepository,
        PlanService $planService,
        ShiftTimeRuleService $ruleService,
    ): JsonResponse {
        [$workspace, $shift] = $this->resolveWorkspaceAndShift($workspacePublicId, $shiftPublicId, $workspaceRepository, $shiftRepository);
        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        if (!$planService->canUseShiftTimeRules($workspace)) {
            return $this->jsonError('Per-day shift schedules require the Espresso plan', 402);
        }

        $rule = $ruleRepository->findOneBy(['publicId' => $rulePublicId]);
        if ($rule === null || $rule->getShift()->getId() !== $shift->getId()) {
            throw new NotFoundHttpException('Time rule not found');
        }

        $data = json_decode($request->getContent(), true);
        $rule = $ruleService->update(
            $rule,
            $data['startTime'] ?? $rule->getStartTime(),
            $data['endTime'] ?? $rule->getEndTime(),
        );

        return $this->jsonSuccess([
            'publicId' => (string) $rule->getPublicId(),
            'dayOfWeek' => $rule->getDayOfWeek()->value,
            'dayOfWeekLabel' => $rule->getDayOfWeek()->label(),
            'startTime' => $rule->getStartTime(),
            'endTime' => $rule->getEndTime(),
        ]);
    }

    #[Route('/{rulePublicId}', name: 'shift_time_rules_delete', methods: ['DELETE'])]
    public function delete(
        string $workspacePublicId,
        string $shiftPublicId,
        string $rulePublicId,
        WorkspaceRepository $workspaceRepository,
        ShiftRepository $shiftRepository,
        ShiftTimeRuleRepository $ruleRepository,
        PlanService $planService,
        ShiftTimeRuleService $ruleService,
    ): JsonResponse {
        [$workspace, $shift] = $this->resolveWorkspaceAndShift($workspacePublicId, $shiftPublicId, $workspaceRepository, $shiftRepository);
        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        if (!$planService->canUseShiftTimeRules($workspace)) {
            return $this->jsonError('Per-day shift schedules require the Espresso plan', 402);
        }

        $rule = $ruleRepository->findOneBy(['publicId' => $rulePublicId]);
        if ($rule === null || $rule->getShift()->getId() !== $shift->getId()) {
            throw new NotFoundHttpException('Time rule not found');
        }

        $ruleService->delete($rule);

        return $this->jsonNoContent();
    }

    private function resolveWorkspaceAndShift(
        string $workspacePublicId,
        string $shiftPublicId,
        WorkspaceRepository $workspaceRepository,
        ShiftRepository $shiftRepository,
    ): array {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $shift = $shiftRepository->findByPublicId($shiftPublicId);
        if ($shift === null || $shift->getWorkspace()->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Shift not found');
        }

        return [$workspace, $shift];
    }
}

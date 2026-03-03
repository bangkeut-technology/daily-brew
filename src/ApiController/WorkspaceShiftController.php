<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\WorkspaceTrait;
use App\Controller\AbstractController;
use App\DTO\ShiftDTO;
use App\Enum\ApiErrorCodeEnum;
use App\Form\ShiftFormType;
use App\Form\ShiftTimeRuleFormType;
use App\Repository\EmployeeRepository;
use App\Repository\ShiftRepository;
use App\Repository\ShiftTimeRuleRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class WorkspaceShiftController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/workspaces/{publicId}/shifts', name: 'workspace_shifts_')]
#[OA\Tag(name: 'Workspace Shifts')]
class WorkspaceShiftController extends AbstractController
{
    use WorkspaceTrait;

    public function __construct(
        TranslatorInterface                    $translator,
        private readonly WorkspaceRepository   $workspaceRepository,
        private readonly ShiftRepository       $shiftRepository,
        private readonly ShiftTimeRuleRepository $shiftTimeRuleRepository,
        private readonly EmployeeRepository    $employeeRepository,
    ) {
        parent::__construct($translator);
    }

    #[Route(name: 'list', methods: ['GET'])]
    public function list(string $publicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SHIFTS, $workspace);

        $shifts = $this->shiftRepository->findByWorkspace($workspace);

        return $this->json(array_map(fn($s) => ShiftDTO::fromEntity($s), $shifts));
    }

    #[Route(name: 'create', methods: ['POST'])]
    public function create(string $publicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SHIFTS, $workspace);

        $shift = $this->shiftRepository->create();
        $shift->setWorkspace($workspace);

        $form = $this->createForm(ShiftFormType::class, $shift);
        $form->submit($request->getPayload()->all());

        if ($form->isSubmitted() && $form->isValid()) {
            $this->shiftRepository->update($shift);

            return $this->json(ShiftDTO::fromEntity($shift, true), Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.shift', domain: 'errors'));
    }

    #[Route('/{shiftPublicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId, string $shiftPublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SHIFTS, $workspace);

        $shift = $this->shiftRepository->findByPublicIdAndWorkspace($shiftPublicId, $workspace);
        if (null === $shift) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $shiftPublicId]);
        }

        return $this->json(ShiftDTO::fromEntity($shift, true));
    }

    #[Route('/{shiftPublicId}', name: 'update', methods: ['PUT'])]
    public function update(string $publicId, string $shiftPublicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SHIFTS, $workspace);

        $shift = $this->shiftRepository->findByPublicIdAndWorkspace($shiftPublicId, $workspace);
        if (null === $shift) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $shiftPublicId]);
        }

        $form = $this->createForm(ShiftFormType::class, $shift);
        $form->submit($request->getPayload()->all(), false);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->shiftRepository->update($shift);

            return $this->json(ShiftDTO::fromEntity($shift, true));
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.shift', domain: 'errors'));
    }

    #[Route('/{shiftPublicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId, string $shiftPublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SHIFTS, $workspace);

        $shift = $this->shiftRepository->findByPublicIdAndWorkspace($shiftPublicId, $workspace);
        if (null === $shift) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $shiftPublicId]);
        }

        $this->shiftRepository->delete($shift);

        return $this->json(['message' => 'Shift deleted.']);
    }

    // ── Time rules ─────────────────────────────────────────────────────────────

    #[Route('/{shiftPublicId}/time-rules', name: 'time_rule_add', methods: ['POST'])]
    public function addTimeRule(string $publicId, string $shiftPublicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SHIFTS, $workspace);

        $shift = $this->shiftRepository->findByPublicIdAndWorkspace($shiftPublicId, $workspace);
        if (null === $shift) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $shiftPublicId]);
        }

        $rule = $this->shiftTimeRuleRepository->create();
        $form = $this->createForm(ShiftTimeRuleFormType::class, $rule);
        $form->submit($request->getPayload()->all());

        if ($form->isSubmitted() && $form->isValid()) {
            $shift->addTimeRule($rule);
            $this->shiftRepository->flush();

            return $this->json(ShiftDTO::fromEntity($shift, true), Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.shift_time_rule', domain: 'errors'));
    }

    #[Route('/{shiftPublicId}/time-rules/{rulePublicId}', name: 'time_rule_remove', methods: ['DELETE'])]
    public function removeTimeRule(string $publicId, string $shiftPublicId, string $rulePublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SHIFTS, $workspace);

        $shift = $this->shiftRepository->findByPublicIdAndWorkspace($shiftPublicId, $workspace);
        if (null === $shift) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $shiftPublicId]);
        }

        $rule = $this->shiftTimeRuleRepository->findByPublicIdAndShift($rulePublicId, $shift);
        if (null === $rule) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $rulePublicId]);
        }

        $shift->removeTimeRule($rule);
        $this->shiftRepository->flush();

        return $this->json(ShiftDTO::fromEntity($shift, true));
    }

    // ── Employee assignment ────────────────────────────────────────────────────
    #[Route('/{shiftPublicId}/employees/{employeePublicId}', name: 'employee_assign', methods: ['POST'])]
    public function assignEmployee(string $publicId, string $shiftPublicId, string $employeePublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SHIFTS, $workspace);

        $shift = $this->shiftRepository->findByPublicIdAndWorkspace($shiftPublicId, $workspace);
        if (null === $shift) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $shiftPublicId]);
        }

        $employee = $this->employeeRepository->findByPublicId($employeePublicId);
        if (null === $employee || $employee->getWorkspace()?->id !== $workspace->id) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $employeePublicId]);
        }

        $employee->setShift($shift);
        $this->shiftRepository->flush();

        return $this->json(ShiftDTO::fromEntity($shift, true));
    }

    #[Route('/{shiftPublicId}/employees/{employeePublicId}', name: 'employee_unassign', methods: ['DELETE'])]
    public function unassignEmployee(string $publicId, string $shiftPublicId, string $employeePublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SHIFTS, $workspace);

        $shift = $this->shiftRepository->findByPublicIdAndWorkspace($shiftPublicId, $workspace);
        if (null === $shift) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $shiftPublicId]);
        }

        $employee = $this->employeeRepository->findByPublicId($employeePublicId);
        if (null === $employee || $employee->getShift()?->id !== $shift->id) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $employeePublicId]);
        }

        $employee->setShift(null);
        $this->shiftRepository->flush();

        return $this->json(ShiftDTO::fromEntity($shift, true));
    }
}

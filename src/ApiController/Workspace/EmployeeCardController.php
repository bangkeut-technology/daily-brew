<?php

declare(strict_types=1);

namespace App\ApiController\Workspace;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\EmployeeCard;
use App\Entity\User;
use App\Repository\EmployeeCardRepository;
use App\Repository\EmployeeRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\Card\CardIssuanceService;
use App\Service\PlanService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/**
 * Issue and revoke the cards employees tap at a kiosk.
 *
 * Gated on `MANAGE_EMPLOYEES` rather than `MANAGE_ATTENDANCES`: handing someone
 * a credential that punches as them is an act of employee administration, not
 * a correction to a record.
 *
 * The pass bytes come back exactly once, from the issue call. They are derived
 * from the card row and the workspace key, never stored — a card that was never
 * written to a tag is re-issued, not recovered.
 *
 * @see docs/card-checkin.md
 */
#[Route('/workspaces/{workspacePublicId}/employee-cards')]
class EmployeeCardController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'employee_cards_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeCardRepository $cards,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_EMPLOYEES, $workspace);

        return $this->jsonSuccess(array_map(
            static fn (EmployeeCard $c) => self::serialize($c),
            $cards->findByWorkspace($workspace),
        ));
    }

    #[Route('', name: 'employee_cards_create', methods: ['POST'])]
    public function create(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employees,
        CardIssuanceService $issuance,
        PlanService $planService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_EMPLOYEES, $workspace);

        if (!$planService->canUseCardCheckin($workspace)) {
            return $this->jsonError('Card check-in requires an Espresso plan.', 403);
        }

        $body = json_decode($request->getContent(), true) ?? [];
        if (!is_array($body)) {
            return $this->jsonError('Request body must be a JSON object.', 422);
        }

        $employeePublicId = $body['employeePublicId'] ?? null;
        if (!is_string($employeePublicId)) {
            return $this->jsonError('employeePublicId is required.', 422);
        }

        $employee = $employees->findOneActiveByPublicIdAndWorkspace($employeePublicId, $workspace);
        if ($employee === null) {
            return $this->jsonError('Employee not found in this workspace.', 404);
        }

        try {
            $issued = $issuance->issue(
                workspace: $workspace,
                employee: $employee,
                label: is_string($body['label'] ?? null) ? $body['label'] : '',
                issuedByEmail: $user->getEmail(),
            );
        } catch (HttpException $e) {
            return $this->jsonError($e->getMessage(), $e->getStatusCode());
        }

        return $this->jsonCreated([
            'card' => self::serialize($issued['card']),
            // Shown once. Write it to the tag now — it cannot be retrieved later.
            'pass' => [
                'base64Url' => $issued['pass']->base64Url,
                'bytes' => base64_encode($issued['pass']->bytes),
            ],
        ]);
    }

    #[Route('/{cardPublicId}', name: 'employee_cards_revoke', methods: ['DELETE'])]
    public function revoke(
        string $workspacePublicId,
        string $cardPublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeCardRepository $cards,
        CardIssuanceService $issuance,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_EMPLOYEES, $workspace);

        $card = $cards->findOneByPublicIdAndWorkspace($cardPublicId, $workspace);
        if ($card === null) {
            throw new NotFoundHttpException('Card not found');
        }

        $body = json_decode($request->getContent(), true) ?? [];
        $reason = is_array($body) && is_string($body['reason'] ?? null) ? $body['reason'] : '';

        try {
            $issuance->revoke($card, $user->getEmail(), $reason);
        } catch (HttpException $e) {
            return $this->jsonError($e->getMessage(), $e->getStatusCode());
        }

        return $this->jsonSuccess(self::serialize($card));
    }

    /** @return array<string, mixed> */
    private static function serialize(EmployeeCard $card): array
    {
        return [
            'publicId' => $card->getPublicId(),
            'label' => $card->getLabel(),
            'employeePublicId' => (string) $card->getEmployee()?->getPublicId(),
            'employeeName' => $card->getEmployee()?->getName(),
            'notBefore' => $card->getNotBefore()->format('c'),
            'notAfter' => $card->getNotAfter()->format('c'),
            'createdAt' => $card->getCreatedAt()->format('c'),
            'issuedByEmail' => $card->getIssuedByEmail(),
            'revokedAt' => $card->getRevokedAt()?->format('c'),
            'revokedByEmail' => $card->getRevokedByEmail(),
            'revokeReason' => $card->getRevokeReason(),
        ];
    }
}

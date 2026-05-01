<?php

declare(strict_types=1);

namespace App\ApiController\Workspace;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\Employee;
use App\Entity\WorkspaceQrCode;
use App\Repository\WorkspaceQrCodeRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\PlanService;
use App\Service\WorkspaceQrCodeService;
use InvalidArgumentException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/workspaces/{workspacePublicId}/qr-codes')]
class WorkspaceQrCodeController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'workspace_qr_codes_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        WorkspaceRepository $workspaceRepository,
        WorkspaceQrCodeRepository $qrCodeRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $qrCodes = $qrCodeRepository->findByWorkspace($workspace);

        return $this->jsonSuccess(array_map(
            fn (WorkspaceQrCode $qr) => $this->serialize($qr),
            $qrCodes,
        ));
    }

    #[Route('', name: 'workspace_qr_codes_create', methods: ['POST'])]
    public function create(
        string $workspacePublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        WorkspaceQrCodeService $qrCodeService,
        PlanService $planService,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $workspace);

        if (!$planService->canUseSubQrCodes($workspace)) {
            return $this->jsonError('Multiple QR codes require the Double Espresso plan', 402);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        try {
            $qrCode = $qrCodeService->create($workspace, $data);
        } catch (InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 422);
        }

        return $this->jsonCreated($this->serialize($qrCode));
    }

    #[Route('/{qrCodePublicId}', name: 'workspace_qr_codes_show', methods: ['GET'])]
    public function show(
        string $workspacePublicId,
        string $qrCodePublicId,
        WorkspaceRepository $workspaceRepository,
        WorkspaceQrCodeRepository $qrCodeRepository,
    ): JsonResponse {
        $qrCode = $this->resolveQrCode($workspacePublicId, $qrCodePublicId, $workspaceRepository, $qrCodeRepository);

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $qrCode);

        return $this->jsonSuccess($this->serialize($qrCode));
    }

    #[Route('/{qrCodePublicId}', name: 'workspace_qr_codes_update', methods: ['PATCH'])]
    public function update(
        string $workspacePublicId,
        string $qrCodePublicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        WorkspaceQrCodeRepository $qrCodeRepository,
        WorkspaceQrCodeService $qrCodeService,
    ): JsonResponse {
        $qrCode = $this->resolveQrCode($workspacePublicId, $qrCodePublicId, $workspaceRepository, $qrCodeRepository);

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $qrCode);

        $data = json_decode($request->getContent(), true) ?? [];

        try {
            $qrCode = $qrCodeService->update($qrCode, $data);
        } catch (InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 422);
        }

        return $this->jsonSuccess($this->serialize($qrCode));
    }

    #[Route('/{qrCodePublicId}', name: 'workspace_qr_codes_delete', methods: ['DELETE'])]
    public function delete(
        string $workspacePublicId,
        string $qrCodePublicId,
        WorkspaceRepository $workspaceRepository,
        WorkspaceQrCodeRepository $qrCodeRepository,
        WorkspaceQrCodeService $qrCodeService,
    ): JsonResponse {
        $qrCode = $this->resolveQrCode($workspacePublicId, $qrCodePublicId, $workspaceRepository, $qrCodeRepository);

        $this->denyAccessUnlessGranted(WorkspaceVoter::DELETE, $qrCode);

        $qrCodeService->delete($qrCode);

        return $this->jsonNoContent();
    }

    private function resolveQrCode(
        string $workspacePublicId,
        string $qrCodePublicId,
        WorkspaceRepository $workspaceRepository,
        WorkspaceQrCodeRepository $qrCodeRepository,
    ): WorkspaceQrCode {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $qrCode = $qrCodeRepository->findByPublicId($qrCodePublicId);
        if (!$qrCode instanceof WorkspaceQrCode || $qrCode->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('QR code not found');
        }

        return $qrCode;
    }

    /** @return array<string, mixed> */
    private function serialize(WorkspaceQrCode $qrCode): array
    {
        return [
            'publicId' => $qrCode->getPublicId(),
            'qrToken' => $qrCode->getQrToken(),
            'name' => $qrCode->getName(),
            'manager' => $qrCode->getManager() !== null ? [
                'publicId' => $qrCode->getManager()->getPublicId(),
                'name' => $qrCode->getManager()->getName(),
            ] : null,
            'assignedEmployees' => array_map(static fn (Employee $e) => [
                'publicId' => $e->getPublicId(),
                'name' => $e->getName(),
            ], $qrCode->getAssignedEmployees()->toArray()),
            'inheritIpSettings' => $qrCode->isInheritIpSettings(),
            'ipRestrictionEnabled' => $qrCode->isIpRestrictionEnabled(),
            'allowedIps' => $qrCode->getAllowedIps(),
            'inheritGeofencing' => $qrCode->isInheritGeofencing(),
            'geofencingEnabled' => $qrCode->isGeofencingEnabled(),
            'geofencingLatitude' => $qrCode->getGeofencingLatitude(),
            'geofencingLongitude' => $qrCode->getGeofencingLongitude(),
            'geofencingRadiusMeters' => $qrCode->getGeofencingRadiusMeters(),
            'inheritDeviceVerification' => $qrCode->isInheritDeviceVerification(),
            'deviceVerificationEnabled' => $qrCode->isDeviceVerificationEnabled(),
            'createdAt' => $qrCode->getCreatedAt()->format('c'),
            'updatedAt' => $qrCode->getUpdatedAt()->format('c'),
        ];
    }
}

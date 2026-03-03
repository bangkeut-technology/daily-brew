<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\WorkspaceTrait;
use App\Controller\AbstractController;
use App\DTO\PayrollRunDTO;
use App\DTO\PayslipDTO;
use App\Enum\ApiErrorCodeEnum;
use App\Enum\PayrollRunStatusEnum;
use App\Form\PayslipItemFormType;
use App\Repository\PayrollRunRepository;
use App\Repository\PayslipItemRepository;
use App\Repository\PayslipRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\PayrollService;
use DateTimeImmutable;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class PayrollController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/workspaces/{publicId}/payroll', name: 'payroll_')]
#[OA\Tag(name: 'Payroll')]
class PayrollController extends AbstractController
{
    use WorkspaceTrait;

    public function __construct(
        TranslatorInterface                     $translator,
        private readonly WorkspaceRepository    $workspaceRepository,
        private readonly PayrollRunRepository   $payrollRunRepository,
        private readonly PayslipRepository      $payslipRepository,
        private readonly PayslipItemRepository  $payslipItemRepository,
        private readonly PayrollService         $payrollService,
    )
    {
        parent::__construct($translator);
    }

    #[Route(name: 'list', methods: ['GET'])]
    public function list(string $publicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW_PAYROLL, $workspace);

        $runs = $this->payrollRunRepository->findByWorkspace($workspace);

        return $this->json(array_map(
            static fn($run) => PayrollRunDTO::fromEntity($run),
            $runs,
        ));
    }

    #[Route(name: 'create', methods: ['POST'])]
    public function create(string $publicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_PAYROLL, $workspace);

        $payload = $request->getPayload();
        $periodStr = $payload->get('period');

        if (empty($periodStr)) {
            return $this->createBadRequestResponse('period is required (format: YYYY-MM)');
        }

        try {
            $period = new DateTimeImmutable($periodStr . '-01');
        } catch (\Exception) {
            return $this->createBadRequestResponse('Invalid period format. Use YYYY-MM.');
        }

        try {
            $run = $this->payrollService->createPayrollRun($workspace, $period, $this->getUser());
        } catch (\LogicException $e) {
            return $this->json(['message' => $e->getMessage()], Response::HTTP_CONFLICT);
        }

        return $this->json(PayrollRunDTO::fromEntity($run), Response::HTTP_CREATED);
    }

    #[Route('/{runPublicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId, string $runPublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW_PAYROLL, $workspace);

        $run = $this->payrollRunRepository->findByPublicIdAndWorkspace($runPublicId, $workspace);
        if (null === $run) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $runPublicId]);
        }

        return $this->json(PayrollRunDTO::fromEntity($run, withPayslips: true));
    }

    #[Route('/{runPublicId}/finalize', name: 'finalize', methods: ['POST'])]
    public function finalize(string $publicId, string $runPublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_PAYROLL, $workspace);

        $run = $this->payrollRunRepository->findByPublicIdAndWorkspace($runPublicId, $workspace);
        if (null === $run) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $runPublicId]);
        }

        try {
            $this->payrollService->finalizePayrollRun($run);
        } catch (\LogicException $e) {
            return $this->json(['message' => $e->getMessage()], Response::HTTP_CONFLICT);
        }

        return $this->json(['message' => 'Payroll run finalized.'], Response::HTTP_OK);
    }

    #[Route('/{runPublicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId, string $runPublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_PAYROLL, $workspace);

        $run = $this->payrollRunRepository->findByPublicIdAndWorkspace($runPublicId, $workspace);
        if (null === $run) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $runPublicId]);
        }

        if ($run->getStatus() === PayrollRunStatusEnum::FINALIZED) {
            return $this->json(['message' => 'Cannot delete a finalized payroll run.'], Response::HTTP_CONFLICT);
        }

        $this->payrollRunRepository->delete($run);

        return $this->json(['message' => 'Payroll run deleted.'], Response::HTTP_OK);
    }

    #[Route('/{runPublicId}/payslips/{slipPublicId}', name: 'get_payslip', methods: ['GET'])]
    public function getPayslip(string $publicId, string $runPublicId, string $slipPublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW_PAYROLL, $workspace);

        $run = $this->payrollRunRepository->findByPublicIdAndWorkspace($runPublicId, $workspace);
        if (null === $run) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $runPublicId]);
        }

        $payslip = $this->payslipRepository->findByPublicIdAndPayrollRun($slipPublicId, $run);
        if (null === $payslip) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $slipPublicId]);
        }

        return $this->json(PayslipDTO::fromEntity($payslip));
    }

    #[Route('/{runPublicId}/payslips/{slipPublicId}/items', name: 'add_payslip_item', methods: ['POST'])]
    public function addPayslipItem(string $publicId, string $runPublicId, string $slipPublicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_PAYROLL, $workspace);

        $run = $this->payrollRunRepository->findByPublicIdAndWorkspace($runPublicId, $workspace);
        if (null === $run) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $runPublicId]);
        }

        if ($run->getStatus() === PayrollRunStatusEnum::FINALIZED) {
            return $this->json(['message' => 'Cannot modify a finalized payroll run.'], Response::HTTP_CONFLICT);
        }

        $payslip = $this->payslipRepository->findByPublicIdAndPayrollRun($slipPublicId, $run);
        if (null === $payslip) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $slipPublicId]);
        }

        $item = $this->payslipItemRepository->create();
        $form = $this->createForm(PayslipItemFormType::class, $item);
        $form->submit($request->getPayload()->all());

        if ($form->isSubmitted() && $form->isValid()) {
            $payslip->addItem($item);

            // Recalculate totals
            $this->recalculatePayslipTotals($payslip);
            $this->payslipRepository->update($payslip);

            return $this->json(PayslipDTO::fromEntity($payslip), Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.payslip_item', domain: 'errors'));
    }

    #[Route('/{runPublicId}/payslips/{slipPublicId}/items/{itemPublicId}', name: 'delete_payslip_item', methods: ['DELETE'])]
    public function deletePayslipItem(string $publicId, string $runPublicId, string $slipPublicId, string $itemPublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_PAYROLL, $workspace);

        $run = $this->payrollRunRepository->findByPublicIdAndWorkspace($runPublicId, $workspace);
        if (null === $run) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $runPublicId]);
        }

        if ($run->getStatus() === PayrollRunStatusEnum::FINALIZED) {
            return $this->json(['message' => 'Cannot modify a finalized payroll run.'], Response::HTTP_CONFLICT);
        }

        $payslip = $this->payslipRepository->findByPublicIdAndPayrollRun($slipPublicId, $run);
        if (null === $payslip) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $slipPublicId]);
        }

        $item = $this->payslipItemRepository->findByPublicIdAndPayslip($itemPublicId, $payslip);
        if (null === $item) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $itemPublicId]);
        }

        $payslip->removeItem($item);
        $this->recalculatePayslipTotals($payslip);
        $this->payslipRepository->update($payslip);

        return $this->json(['message' => 'Item removed.'], Response::HTTP_OK);
    }

    #[Route('/{runPublicId}/payslips/{slipPublicId}/pay', name: 'pay_payslip', methods: ['POST'])]
    public function payPayslip(string $publicId, string $runPublicId, string $slipPublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_PAYROLL, $workspace);

        $run = $this->payrollRunRepository->findByPublicIdAndWorkspace($runPublicId, $workspace);
        if (null === $run) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $runPublicId]);
        }

        $payslip = $this->payslipRepository->findByPublicIdAndPayrollRun($slipPublicId, $run);
        if (null === $payslip) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $slipPublicId]);
        }

        $this->payrollService->markPayslipAsPaid($payslip);

        return $this->json(PayslipDTO::fromEntity($payslip));
    }

    /**
     * Recalculate allowances, deductions, and net pay based on items.
     */
    private function recalculatePayslipTotals(\App\Entity\Payslip $payslip): void
    {
        $totalAllowances = 0.0;
        $totalDeductions = 0.0;

        foreach ($payslip->getItems() as $item) {
            $amount = (float) $item->getAmount();
            match ($item->getType()) {
                \App\Enum\PayslipItemTypeEnum::BONUS, \App\Enum\PayslipItemTypeEnum::ALLOWANCE => $totalAllowances += $amount,
                \App\Enum\PayslipItemTypeEnum::DEDUCTION => $totalDeductions += $amount,
            };
        }

        $payslip->setTotalAllowances((string) round($totalAllowances, 2));
        $payslip->setTotalDeductions((string) round($totalDeductions, 2));
        $baseSalary = (float) $payslip->getBaseSalary();
        $payslip->setNetPay((string) round($baseSalary + $totalAllowances - $totalDeductions, 2));
    }
}

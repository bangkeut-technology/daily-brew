<?php

declare(strict_types=1);

namespace App\ApiController\Employee;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\EmployeeDTO;
use App\Repository\EmployeeRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\EmployeeService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Vich\UploaderBundle\Templating\Helper\UploaderHelper;

/**
 * Headshot lifecycle for an employee inside a workspace. The voter resolves
 * WorkspaceVoter::EDIT on an Employee subject to the manage_employees
 * capability — so the workspace owner and any manager with that permission
 * can manage the photo; per-QR managers (attendance/leave-only) cannot.
 */
#[Route('/workspaces/{workspacePublicId}/employees/{publicId}/photo')]
class EmployeePhotoController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'employees_photo_upload', methods: ['POST'])]
    public function upload(
        string $workspacePublicId,
        string $publicId,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        EmployeeService $employeeService,
        UploaderHelper $uploaderHelper,
    ): JsonResponse {
        $employee = $this->loadEmployee($workspacePublicId, $publicId, $workspaceRepository, $employeeRepository);

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $employee);

        $file = $request->files->get('file');
        if ($file === null) {
            return $this->jsonError('No file uploaded (expected multipart field "file").');
        }

        try {
            $employee = $employeeService->uploadPhoto($employee, $file);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 400);
        }

        return $this->jsonSuccess(
            EmployeeDTO::fromEntity($employee, $uploaderHelper->asset($employee, 'imageFile'))->toArray(),
        );
    }

    #[Route('', name: 'employees_photo_delete', methods: ['DELETE'])]
    public function delete(
        string $workspacePublicId,
        string $publicId,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        EmployeeService $employeeService,
        UploaderHelper $uploaderHelper,
    ): JsonResponse {
        $employee = $this->loadEmployee($workspacePublicId, $publicId, $workspaceRepository, $employeeRepository);

        $this->denyAccessUnlessGranted(WorkspaceVoter::EDIT, $employee);

        $employeeService->removePhoto($employee);

        return $this->jsonSuccess(
            EmployeeDTO::fromEntity($employee, $uploaderHelper->asset($employee, 'imageFile'))->toArray(),
        );
    }

    private function loadEmployee(
        string $workspacePublicId,
        string $publicId,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
    ): \App\Entity\Employee {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $employee = $employeeRepository->findByPublicId($publicId);
        if ($employee === null || $employee->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new NotFoundHttpException('Employee not found');
        }

        return $employee;
    }
}

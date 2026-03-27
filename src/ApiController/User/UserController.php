<?php

declare(strict_types=1);

namespace App\ApiController\User;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Repository\EmployeeRepository;
use App\Repository\WorkspaceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/users')]
class UserController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/me', name: 'users_me', methods: ['GET'])]
    public function me(
        #[CurrentUser] User $user,
    ): JsonResponse {
        return $this->jsonSuccess([
            'publicId' => (string) $user->getPublicId(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'fullName' => $user->getFullName(),
            'locale' => $user->getLocale(),
            'onboardingCompleted' => $user->isOnboardingCompleted(),
        ]);
    }

    #[Route('/me/current-workspace', name: 'users_me_current_workspace', methods: ['GET'])]
    public function currentWorkspace(
        #[CurrentUser] User $user,
    ): JsonResponse {
        $workspace = $user->getCurrentWorkspace();

        if ($workspace === null) {
            return $this->jsonSuccess(null);
        }

        return $this->jsonSuccess([
            'publicId' => (string) $workspace->getPublicId(),
            'name' => $workspace->getName(),
        ]);
    }

    /**
     * Returns role context — whether the user is an owner, employee, or both.
     */
    #[Route('/me/role-context', name: 'users_me_role_context', methods: ['GET'])]
    public function roleContext(
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
    ): JsonResponse {
        $ownedWorkspaces = $workspaceRepository->findByOwner($user);
        $employee = $employeeRepository->findByLinkedUser($user);

        $currentWorkspace = $user->getCurrentWorkspace();
        $isOwnerOfCurrent = false;
        $isEmployeeInCurrent = false;

        if ($currentWorkspace !== null) {
            $isOwnerOfCurrent = $currentWorkspace->getOwner()?->getId() === $user->getId();
            if ($employee !== null) {
                $isEmployeeInCurrent = $employee->getWorkspace()?->getId() === $currentWorkspace->getId();
            }
        }

        return $this->jsonSuccess([
            'isOwner' => $isOwnerOfCurrent,
            'isEmployee' => $isEmployeeInCurrent,
            'onboardingCompleted' => $user->isOnboardingCompleted(),
            'ownedWorkspaces' => array_map(fn ($w) => [
                'publicId' => (string) $w->getPublicId(),
                'name' => $w->getName(),
            ], $ownedWorkspaces),
            'employee' => $employee ? [
                'publicId' => (string) $employee->getPublicId(),
                'name' => $employee->getName(),
                'workspacePublicId' => $employee->getWorkspace() ? (string) $employee->getWorkspace()->getPublicId() : null,
                'workspaceName' => $employee->getWorkspace()?->getName(),
                'qrToken' => $employee->getQrToken(),
            ] : null,
        ]);
    }

    #[Route('/me/link-employee', name: 'users_me_link_employee', methods: ['POST'])]
    public function linkEmployee(
        #[CurrentUser] User $user,
        Request $request,
        EmployeeRepository $employeeRepository,
        EntityManagerInterface $em,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $employeePublicId = $data['employeePublicId'] ?? null;

        if (!$employeePublicId) {
            return $this->jsonError('employeePublicId is required');
        }

        $existing = $employeeRepository->findByLinkedUser($user);
        if ($existing !== null) {
            return $this->jsonError('You are already linked to an employee record');
        }

        $employee = $employeeRepository->findByPublicId($employeePublicId);
        if ($employee === null) {
            return $this->jsonError('Employee not found');
        }

        if ($employee->getLinkedUser() !== null) {
            return $this->jsonError('This employee is already linked to a user');
        }

        $employee->setLinkedUser($user);
        $em->flush();

        return $this->jsonSuccess([
            'publicId' => (string) $employee->getPublicId(),
            'name' => $employee->getName(),
            'workspaceName' => $employee->getWorkspace()?->getName(),
        ]);
    }

    #[Route('/me/complete-onboarding', name: 'users_me_complete_onboarding', methods: ['POST'])]
    public function completeOnboarding(
        #[CurrentUser] User $user,
        EntityManagerInterface $em,
    ): JsonResponse {
        $user->setOnboardingCompleted(true);
        $em->flush();

        return $this->jsonSuccess(['onboardingCompleted' => true]);
    }
}

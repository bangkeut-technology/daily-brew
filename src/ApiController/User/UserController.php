<?php

declare(strict_types=1);

namespace App\ApiController\User;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\UserDTO;
use App\Entity\User;
use App\Enum\OAuthProviderEnum;
use App\Repository\EmployeeRepository;
use App\Repository\WorkspaceRepository;
use App\Service\AccountDeletionService;
use App\Service\AuthService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
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
        return $this->jsonSuccess(UserDTO::fromEntity($user)->toArray());
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

    #[Route('/me/current-workspace', name: 'users_me_set_current_workspace', methods: ['PUT'])]
    public function setCurrentWorkspace(
        #[CurrentUser] User $user,
        Request $request,
        WorkspaceRepository $workspaceRepository,
        EntityManagerInterface $em,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $workspacePublicId = $data['workspacePublicId'] ?? null;

        if ($workspacePublicId) {
            $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
            if ($workspace === null) {
                return $this->jsonError('Workspace not found', 404);
            }
            $user->setCurrentWorkspace($workspace);
        } else {
            $user->setCurrentWorkspace(null);
        }

        $em->flush();

        return $this->jsonSuccess(null);
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
                'qrToken' => $employee->getQrToken(),
                'name' => $employee->getName(),
                'workspacePublicId' => $employee->getWorkspace() ? (string) $employee->getWorkspace()->getPublicId() : null,
                'workspaceName' => $employee->getWorkspace()?->getName(),
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

    // ── Profile ────────────────────────────────────────────────

    #[Route('/me', name: 'users_me_update', methods: ['PUT'])]
    public function updateProfile(
        #[CurrentUser] User $user,
        Request $request,
        EntityManagerInterface $em,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }
        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }
        if (isset($data['locale'])) {
            $user->setLocale($data['locale']);
        }

        $em->flush();

        return $this->jsonSuccess(UserDTO::fromEntity($user)->toArray());
    }

    #[Route('/me/change-password', name: 'users_me_change_password', methods: ['POST'])]
    public function changePassword(
        #[CurrentUser] User $user,
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $currentPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (empty($newPassword)) {
            return $this->jsonError('New password is required');
        }

        if (strlen($newPassword) < 8) {
            return $this->jsonError('Password must be at least 8 characters');
        }

        // If user has a password set, verify current password
        if ($user->hasPassword()) {
            if (empty($currentPassword) || !$passwordHasher->isPasswordValid($user, $currentPassword)) {
                return $this->jsonError('Current password is incorrect', 403);
            }
        }

        $user->setPassword($passwordHasher->hashPassword($user, $newPassword));
        $em->flush();

        return $this->jsonSuccess(['message' => 'Password updated']);
    }

    // ── OAuth connections ──────────────────────────────────────

    #[Route('/me/oauth', name: 'users_me_oauth', methods: ['GET'])]
    public function oauthConnections(
        #[CurrentUser] User $user,
    ): JsonResponse {
        return $this->jsonSuccess([
            'google' => $user->hasOAuth(OAuthProviderEnum::GOOGLE),
            'apple' => $user->hasOAuth(OAuthProviderEnum::APPLE),
            'hasPassword' => $user->hasPassword(),
        ]);
    }

    #[Route('/me/oauth/{provider}', name: 'users_me_oauth_connect', methods: ['POST'])]
    public function connectOAuth(
        string $provider,
        #[CurrentUser] User $user,
        Request $request,
        AuthService $authService,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        try {
            $providerEnum = OAuthProviderEnum::from($provider);
        } catch (\ValueError) {
            return $this->jsonError('Invalid provider');
        }

        $providerId = match ($providerEnum) {
            OAuthProviderEnum::GOOGLE => $data['googleId'] ?? '',
            OAuthProviderEnum::APPLE => $data['appleId'] ?? '',
        };

        if (empty($providerId)) {
            return $this->jsonError('Provider ID is required');
        }

        try {
            match ($providerEnum) {
                OAuthProviderEnum::GOOGLE => $authService->connectGoogle($user, $providerId),
                OAuthProviderEnum::APPLE => $authService->connectApple($user, $providerId),
            };
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 409);
        }

        return $this->jsonSuccess(['connected' => true]);
    }

    #[Route('/me/oauth/{provider}', name: 'users_me_oauth_disconnect', methods: ['DELETE'])]
    public function disconnectOAuth(
        string $provider,
        #[CurrentUser] User $user,
        AuthService $authService,
    ): JsonResponse {
        try {
            $providerEnum = OAuthProviderEnum::from($provider);
        } catch (\ValueError) {
            return $this->jsonError('Invalid provider');
        }

        try {
            match ($providerEnum) {
                OAuthProviderEnum::GOOGLE => $authService->disconnectGoogle($user),
                OAuthProviderEnum::APPLE => $authService->disconnectApple($user),
            };
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 400);
        }

        return $this->jsonSuccess(['disconnected' => true]);
    }

    // ── Account deletion ──────────────────────────────────────

    #[Route('/me', name: 'users_me_delete', methods: ['DELETE'])]
    public function deleteAccount(
        #[CurrentUser] User $user,
        AccountDeletionService $accountDeletionService,
    ): JsonResponse {
        $accountDeletionService->softDelete($user);

        $response = $this->jsonSuccess(['deleted' => true]);
        $response->headers->clearCookie('BEARER', '/');
        $response->headers->clearCookie('refresh_token', '/');

        return $response;
    }
}

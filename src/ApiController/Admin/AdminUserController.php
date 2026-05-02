<?php

declare(strict_types=1);

namespace App\ApiController\Admin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Enum\AdminAuditActionEnum;
use App\Enum\AdminAuditTargetTypeEnum;
use App\Enum\UserRoleEnum;
use App\Repository\EmployeeRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Service\AdminAuditService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/admin/users')]
class AdminUserController extends AbstractController
{
    use ApiResponseTrait;

    private const int PAGE_SIZE = 25;

    #[Route('', name: 'admin_users_list', methods: ['GET'])]
    public function list(
        Request $request,
        UserRepository $userRepository,
    ): JsonResponse {
        $page = max(1, (int) $request->query->get('page', '1'));
        $search = trim((string) $request->query->get('search', ''));
        $superAdminOnly = $request->query->getBoolean('superAdminOnly');

        $qb = $userRepository->createQueryBuilder('u')
            ->orderBy('u.createdAt', 'DESC');

        if ($search !== '') {
            $qb->andWhere('LOWER(u.email) LIKE :q OR LOWER(u.firstName) LIKE :q OR LOWER(u.lastName) LIKE :q')
               ->setParameter('q', '%' . mb_strtolower($search) . '%');
        }

        if ($superAdminOnly) {
            // Roles are stored as a JSON array; match the quoted enum value to avoid
            // accidental substring matches if new role names share a prefix.
            $qb->andWhere('u.roles LIKE :role')
               ->setParameter('role', '%"' . UserRoleEnum::SUPER_ADMIN->value . '"%');
        }

        $total = (clone $qb)->select('COUNT(u.id)')->resetDQLPart('orderBy')->getQuery()->getSingleScalarResult();

        /** @var User[] $users */
        $users = $qb
            ->setFirstResult(($page - 1) * self::PAGE_SIZE)
            ->setMaxResults(self::PAGE_SIZE)
            ->getQuery()
            ->getResult();

        $items = array_map(fn (User $u) => [
            'publicId' => (string) $u->getPublicId(),
            'email' => $u->getEmail(),
            'fullName' => $u->getFullName(),
            'firstName' => $u->getFirstName(),
            'lastName' => $u->getLastName(),
            'isSuperAdmin' => $u->hasRole(UserRoleEnum::SUPER_ADMIN->value),
            'hasGoogle' => $u->getGoogleId() !== null,
            'hasApple' => $u->getAppleId() !== null,
            'hasPassword' => $u->hasPassword(),
            'createdAt' => $u->getCreatedAt()->format('c'),
        ], $users);

        return $this->jsonSuccess([
            'items' => $items,
            'page' => $page,
            'pageSize' => self::PAGE_SIZE,
            'total' => (int) $total,
        ]);
    }

    #[Route('/{publicId}', name: 'admin_users_show', methods: ['GET'])]
    public function show(
        string $publicId,
        UserRepository $userRepository,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
    ): JsonResponse {
        $user = $userRepository->findByPublicId($publicId);
        if (!$user instanceof User) {
            throw new NotFoundHttpException('User not found');
        }

        $ownedWorkspaces = $workspaceRepository->findByOwner($user);
        $linkedEmployees = $employeeRepository->findByLinkedUser($user);

        return $this->jsonSuccess([
            'publicId' => (string) $user->getPublicId(),
            'email' => $user->getEmail(),
            'fullName' => $user->getFullName(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'locale' => $user->getLocale(),
            'isSuperAdmin' => $user->hasRole(UserRoleEnum::SUPER_ADMIN->value),
            'hasGoogle' => $user->getGoogleId() !== null,
            'hasApple' => $user->getAppleId() !== null,
            'hasPassword' => $user->hasPassword(),
            'onboardingCompleted' => $user->isOnboardingCompleted(),
            'createdAt' => $user->getCreatedAt()->format('c'),
            'updatedAt' => $user->getUpdatedAt()->format('c'),
            'ownedWorkspaces' => array_map(fn ($w) => [
                'publicId' => (string) $w->getPublicId(),
                'name' => $w->getName(),
                'deletedAt' => $w->getDeletedAt()?->format('c'),
            ], $ownedWorkspaces),
            'linkedWorkspaces' => array_map(fn ($e) => [
                'employeePublicId' => (string) $e->getPublicId(),
                'employeeName' => $e->getName(),
                'workspacePublicId' => $e->getWorkspace() ? (string) $e->getWorkspace()->getPublicId() : null,
                'workspaceName' => $e->getWorkspace()?->getName(),
                'role' => $e->getRole()->value,
            ], $linkedEmployees),
        ]);
    }

    #[Route('/{publicId}/promote', name: 'admin_users_promote', methods: ['POST'])]
    public function promote(
        string $publicId,
        UserRepository $userRepository,
        AdminAuditService $auditService,
        #[CurrentUser] User $currentUser,
    ): JsonResponse {
        $user = $userRepository->findByPublicId($publicId);
        if (!$user instanceof User) {
            throw new NotFoundHttpException('User not found');
        }

        if ($user->hasRole(UserRoleEnum::SUPER_ADMIN->value)) {
            return $this->jsonError('User is already a super admin', 409);
        }

        $user->setSuperAdmin(true);
        $userRepository->update($user);

        $auditService->record(
            actor: $currentUser,
            action: AdminAuditActionEnum::PromoteUser,
            targetType: AdminAuditTargetTypeEnum::User,
            targetPublicId: (string) $user->getPublicId(),
            targetLabel: $user->getEmail(),
        );

        return $this->jsonSuccess(['isSuperAdmin' => true]);
    }

    #[Route('/{publicId}/demote', name: 'admin_users_demote', methods: ['POST'])]
    public function demote(
        string $publicId,
        UserRepository $userRepository,
        AdminAuditService $auditService,
        #[CurrentUser] User $currentUser,
    ): JsonResponse {
        $user = $userRepository->findByPublicId($publicId);
        if (!$user instanceof User) {
            throw new NotFoundHttpException('User not found');
        }

        if ($user->getId() === $currentUser->getId()) {
            return $this->jsonError('You cannot demote yourself', 400);
        }

        if (!$user->hasRole(UserRoleEnum::SUPER_ADMIN->value)) {
            return $this->jsonError('User is not a super admin', 409);
        }

        $user->setSuperAdmin(false);
        $userRepository->update($user);

        $auditService->record(
            actor: $currentUser,
            action: AdminAuditActionEnum::DemoteUser,
            targetType: AdminAuditTargetTypeEnum::User,
            targetPublicId: (string) $user->getPublicId(),
            targetLabel: $user->getEmail(),
        );

        return $this->jsonSuccess(['isSuperAdmin' => false]);
    }
}

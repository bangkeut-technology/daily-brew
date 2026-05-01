<?php

declare(strict_types=1);

namespace App\ApiController\Admin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\EmployeeRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin')]
class AdminDashboardController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/dashboard', name: 'admin_dashboard', methods: ['GET'])]
    public function dashboard(
        UserRepository $userRepository,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        SubscriptionRepository $subscriptionRepository,
    ): JsonResponse {
        return $this->jsonSuccess([
            'totals' => [
                'users' => $userRepository->count([]),
                'workspaces' => $workspaceRepository->count(['deletedAt' => null]),
                'employees' => $employeeRepository->count(['deletedAt' => null]),
                'subscriptions' => $subscriptionRepository->count([]),
            ],
        ]);
    }
}

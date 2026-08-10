<?php

declare(strict_types=1);

namespace App\ApiController\Admin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Service\AdminChurnService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/churn')]
class AdminChurnController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'admin_churn', methods: ['GET'])]
    public function churn(Request $request, AdminChurnService $churnService): JsonResponse
    {
        // An out-of-range window falls back to the default rather than 400ing —
        // this is a dashboard, and a stale bookmark shouldn't blank the page.
        $days = (int) $request->query->get('days', (string) AdminChurnService::DEFAULT_WINDOW_DAYS);
        $page = (int) $request->query->get('page', '1');

        return $this->jsonSuccess($churnService->build($days, $page));
    }
}

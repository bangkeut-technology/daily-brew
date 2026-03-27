<?php

namespace App\ApiController\Auth;

use App\ApiController\Trait\ApiResponseTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class LogoutController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/auth/logout', name: 'auth_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        $response = $this->jsonSuccess(['message' => 'Logged out']);

        $response->headers->clearCookie('BEARER', '/');
        $response->headers->clearCookie('refresh_token', '/');

        return $response;
    }
}

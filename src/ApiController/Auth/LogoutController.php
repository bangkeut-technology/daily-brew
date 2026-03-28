<?php

namespace App\ApiController\Auth;

use App\ApiController\Trait\ApiResponseTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class LogoutController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/auth/logout', name: 'auth_logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        $secure = $request->isSecure();

        $response = $this->jsonSuccess(['message' => 'Logged out']);

        $response->headers->setCookie(Cookie::create('BEARER')
            ->withValue('')
            ->withExpires(1)
            ->withPath('/')
            ->withSecure($secure)
            ->withHttpOnly(true)
            ->withSameSite('lax'));

        $response->headers->setCookie(Cookie::create('refresh_token')
            ->withValue('')
            ->withExpires(1)
            ->withPath('/')
            ->withSecure($secure)
            ->withHttpOnly(true)
            ->withSameSite('lax'));

        return $response;
    }
}

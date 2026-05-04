<?php

namespace App\ApiController\Auth;

use App\ApiController\Trait\ApiResponseTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class LogoutController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/auth/logout', name: 'auth_logout', methods: ['POST'])]
    public function logout(Request $request): Response
    {
        // Invalidate the PHP session so the stored security token is cleared
        if ($request->hasSession()) {
            $request->getSession()->invalidate();
        }

        $isXhr = $request->headers->has('X-Requested-With')
            || str_contains($request->headers->get('Accept', ''), 'application/json');

        $response = $isXhr
            ? $this->jsonSuccess(['message' => 'Logged out'])
            : new RedirectResponse('/sign-in');

        // Expire both cookies. Path must match what was originally set — BEARER lives
        // at /api/v1 (lexik_jwt_authentication.yaml), refresh_token at /. A clear
        // cookie with a different path is treated as a separate cookie by the browser
        // and leaves the original alive.
        $cookies = [
            'BEARER' => '/api/v1',
            'refresh_token' => '/',
        ];
        foreach ($cookies as $name => $path) {
            $response->headers->setCookie(
                \Symfony\Component\HttpFoundation\Cookie::create($name)
                    ->withValue('')
                    ->withExpires(1)
                    ->withPath($path)
                    ->withDomain(null)
                    ->withSecure($request->isSecure())
                    ->withHttpOnly(true)
                    ->withSameSite('lax')
            );
        }

        return $response;
    }
}

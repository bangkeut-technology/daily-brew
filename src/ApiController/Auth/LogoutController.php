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

        // Expire both cookies — match every attribute the browser might have stored
        foreach (['BEARER', 'refresh_token'] as $name) {
            $response->headers->setCookie(
                \Symfony\Component\HttpFoundation\Cookie::create($name)
                    ->withValue('')
                    ->withExpires(1)
                    ->withPath('/')
                    ->withDomain(null)
                    ->withSecure($request->isSecure())
                    ->withHttpOnly(true)
                    ->withSameSite('lax')
            );
        }

        return $response;
    }
}
